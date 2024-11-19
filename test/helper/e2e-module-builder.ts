import { Logger, LoggerService, Module, ModuleMetadata } from '@nestjs/common';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';
import { ApplicationConfig as CoreApplicationConfig } from '@nestjs/core/application-config';
import { NestContainer } from '@nestjs/core/injector/container';
import { GraphInspector } from '@nestjs/core/inspector/graph-inspector';
import { NoopGraphInspector } from '@nestjs/core/inspector/noop-graph-inspector';
import {
  UuidFactory,
  UuidFactoryMode,
} from '@nestjs/core/inspector/uuid-factory';
import { ModuleDefinition } from '@nestjs/core/interfaces/module-definition.interface';
import { ModuleOverride } from '@nestjs/core/interfaces/module-override.interface';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { DependenciesScanner } from '@nestjs/core/scanner';
import {
  MockFactory,
  OverrideByFactoryOptions,
} from '@nestjs/testing/interfaces';
import { TestingLogger } from '@nestjs/testing/services/testing-logger.service';
import { TestingInjector } from '@nestjs/testing/testing-injector';
import { TestingInstanceLoader } from '@nestjs/testing/testing-instance-loader';
import { TestingModule } from '@nestjs/testing/testing-module';
import { IE2eOverrideModule } from './interfaces/overrideModule.interface';
import { IE2eOverrideBy } from './interfaces/overrideBy.interface';
import { ApplicationAdapter, ApplicationConfig } from '@libs/common';
import { INestFastifyE2eApplication } from './interfaces/nestFastifyApplicationE2eTest.interface';
import { DataSource } from 'typeorm';
import TestAgent from 'supertest/lib/agent';
import request from 'supertest';

export class E2eTestingModuleBuilder {
  private readonly applicationConfig = new CoreApplicationConfig();
  private readonly container = new NestContainer(this.applicationConfig);
  private readonly overloadsMap = new Map();
  private readonly moduleOverloadsMap = new Map<
    ModuleDefinition,
    ModuleDefinition
  >();
  private readonly module: any;
  private testingLogger: LoggerService;
  private mocker?: MockFactory;

  constructor(
    private readonly metadataScanner: MetadataScanner,
    metadata: ModuleMetadata,
  ) {
    this.module = this.createModule(metadata);
  }

  /**
   * Sets the logger service to use in the testing module.
   * @param testingLogger the logger service to use
   * @returns the builder instance
   */
  public setLogger(testingLogger: LoggerService) {
    this.testingLogger = testingLogger;
    return this;
  }

  /**
   * Override a pipe by providing a custom implementation or a mock.
   * If you want to use a custom pipe, you can use the `useValue` method.
   * If you want to use a mock, you can use the `useMock` method.
   * @param typeOrToken the pipe token (class, string, etc.)
   * @returns the builder instance
   */
  public overridePipe<T = any>(typeOrToken: T): IE2eOverrideBy {
    return this.override(typeOrToken, false);
  }

  /**
   * Set the mock factory to use when creating the testing module.
   * The mock factory is used to create mocks for the module's dependencies.
   * @param mocker the mock factory to use
   * @returns the builder instance
   */
  public useMocker(mocker: MockFactory): this {
    this.mocker = mocker;
    return this;
  }

  /**
   * Override a filter by providing a custom implementation or a mock.
   * If you want to use a custom filter, you can use the `useValue` method.
   * If you want to use a mock, you can use the `useMock` method.
   * @param typeOrToken the filter token (class, string, etc.)
   * @returns the builder instance
   */
  public overrideFilter<T = any>(typeOrToken: T): IE2eOverrideBy {
    return this.override(typeOrToken, false);
  }

  /**
   * Override a guard by providing a custom implementation or a mock.
   * If you want to use a custom guard, you can use the `useValue` method.
   * If you want to use a mock, you can use the `useMock` method.
   * @param typeOrToken the guard token (class, string, etc.)
   * @returns the builder instance
   */
  public overrideGuard<T = any>(typeOrToken: T): IE2eOverrideBy {
    return this.override(typeOrToken, false);
  }

  /**
   * Override an interceptor by providing a custom implementation or a mock.
   * If you want to use a custom interceptor, you can use the `useValue` method.
   * If you want to use a mock, you can use the `useMock` method.
   * @param typeOrToken the interceptor token (class, string, etc.)
   * @returns the builder instance
   */
  public overrideInterceptor<T = any>(typeOrToken: T): IE2eOverrideBy {
    return this.override(typeOrToken, false);
  }

  /**
   * Override a provider by providing a custom implementation or a mock.
   * If you want to use a custom provider, you can use the `useValue` method.
   * If you want to use a mock, you can use the `useMock` method.
   * @param typeOrToken the provider token (class, string, etc.)
   * @returns the builder instance
   */
  public overrideProvider<T = any>(typeOrToken: T): IE2eOverrideBy {
    return this.override(typeOrToken, true);
  }

  /**
   * Overrides an existing module with a new module definition.
   *
   * @param moduleToOverride - The module definition to be overridden.
   * @returns An interface that allows specifying the new module to use.
   */
  public overrideModule(
    moduleToOverride: ModuleDefinition,
  ): IE2eOverrideModule {
    return {
      useModule: (newModule) => {
        this.moduleOverloadsMap.set(moduleToOverride, newModule);
        return this;
      },
    };
  }

  /**
   * Compiles the testing module and returns an instance of `INestFastifyE2eApplication`.
   * This method sets up the logger, configures the graph inspector based on the provided
   * options, scans for dependencies, applies module overloads, and creates instances of
   * dependencies. It prepares the root module and returns a Fastify-based Nest application
   * for end-to-end testing.
   *
   * @param options - Optional configuration for the application context, allowing
   *                  specifying 'snapshot' or 'preview' modes.
   * @returns A promise that resolves to an instance of `INestFastifyE2eApplication`.
   */
  public async compile(
    options: Pick<NestApplicationContextOptions, 'snapshot' | 'preview'> = {},
  ): Promise<INestFastifyE2eApplication> {
    this.applyLogger();

    let graphInspector: GraphInspector;
    if (options?.snapshot) {
      graphInspector = new GraphInspector(this.container);
      UuidFactory.mode = UuidFactoryMode.Deterministic;
    } else {
      graphInspector = NoopGraphInspector;
      UuidFactory.mode = UuidFactoryMode.Random;
    }

    const scanner = new DependenciesScanner(
      this.container,
      this.metadataScanner,
      graphInspector,
      this.applicationConfig,
    );
    await scanner.scan(this.module, {
      overrides: this.getModuleOverloads(),
    });

    this.applyOverloadsMap();
    await this.createInstancesOfDependencies(graphInspector, options);
    scanner.applyApplicationProviders();

    const root = this.getRootModule();
    const testingModule = new TestingModule(
      this.container,
      graphInspector,
      root,
      this.applicationConfig,
    );
    return this.createNestApplication(testingModule);
  }

  /**
   * Creates a Nest application using the provided testing module and configures
   * it for end-to-end testing. This method sets up the application, creates
   * a Fastify adapter, and adds a shutdown method to the application.
   * @param testingModule - The testing module to create the application from.
   * @returns A promise that resolves to an instance of `INestFastifyE2eApplication`.
   */
  private async createNestApplication(
    testingModule: TestingModule,
  ): Promise<INestFastifyE2eApplication> {
    const app = testingModule.createNestApplication<INestFastifyE2eApplication>(
      new ApplicationAdapter(),
    );

    await this.setupApplication(app);

    this.applayNestApplicationMethods(app);

    return app;
  }

  /**
   * Applies additional methods to the given Nest Fastify application instance.
   *
   * This function enhances the application by adding a `shutdown` method to
   * gracefully shut down the application and a `getTestAgent` method to
   * retrieve a test agent for making HTTP requests during testing.
   *
   * @param app - The Nest Fastify application instance to augment.
   */
  private applayNestApplicationMethods(app: INestFastifyE2eApplication): void {
    app.shutdown = async () => await this.shutdown(app);
    app.getTestAgent = () => this.getTestAgent(app);
  }

  /**
   * Retrieves a test agent for the given Nest Fastify application.
   *
   * @param app - The Nest Fastify application instance.
   * @returns A `TestAgent` instance for making HTTP requests to the application.
   */
  private getTestAgent(app: INestFastifyE2eApplication): TestAgent {
    const httpServer = app.getHttpServer();
    return request(httpServer);
  }

  /**
   * Sets up the Nest application for end-to-end testing by configuring the Fastify
   * adapter and initializing the application.
   * @param app - The Nest application to set up.
   */
  private async setupApplication(
    app: INestFastifyE2eApplication,
  ): Promise<void> {
    ApplicationConfig.setup(app, 'api');
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  }

  /**
   * Shuts down the Nest application and the underlying data source.
   * @param app - The Nest application to shut down.
   * @returns A promise that resolves when the application and data source have been shut down.
   */
  private async shutdown(app: INestFastifyE2eApplication): Promise<void> {
    const dataSource = app.get(DataSource);
    await dataSource.destroy();
    await app.close();
    jest.clearAllMocks();
  }

  /**
   * Overrides a provider or a value in the module.
   *
   * @param typeOrToken - The type or token of the provider or value to override.
   * @param isProvider - Whether the type or token is a provider or not.
   * @returns An interface that allows specifying the override.
   */
  private override<T = any>(
    typeOrToken: T,
    isProvider: boolean,
  ): IE2eOverrideBy {
    const addOverload = (options: any) => {
      this.overloadsMap.set(typeOrToken, {
        ...options,
        isProvider,
      });
      return this;
    };
    return this.createOverrideByBuilder(addOverload);
  }

  /**
   * Creates an interface that allows specifying an override for a provider or value.
   * This method is used internally by the `override` method.
   * @param add - A function that adds the override to the map of overloads.
   * @returns An interface that allows specifying the override.
   */
  private createOverrideByBuilder(
    add: (provider: any) => this,
  ): IE2eOverrideBy {
    return {
      useValue: (value) => add({ useValue: value }),
      useFactory: (options: OverrideByFactoryOptions) =>
        add({ ...options, useFactory: options.factory }),
      useClass: (metatype) => add({ useClass: metatype }),
    };
  }

  /**
   * Applies the overloads to the container by replacing the providers.
   * @remarks
   * This method is called internally by the {@link E2eTestingModuleBuilder}
   * when building the module.
   */
  private applyOverloadsMap() {
    const overloads = [...this.overloadsMap.entries()];
    overloads.forEach(([item, options]) => {
      this.container.replace(item, options);
    });
  }

  /**
   * Gets the overloads of the modules. The overloads are returned as an array
   * of objects with the following properties:
   * - `moduleToReplace`: The module to be replaced.
   * - `newModule`: The new module that replaces it.
   * @returns An array of module overloads.
   */
  private getModuleOverloads(): ModuleOverride[] {
    const overloads = [...this.moduleOverloadsMap.entries()];
    return overloads.map(([moduleToReplace, newModule]) => ({
      moduleToReplace,
      newModule,
    }));
  }

  /**
   * Retrieves the root module from the container.
   *
   * @returns The first module in the container, which is considered the root module.
   */
  private getRootModule() {
    const modules = this.container.getModules().values();
    return modules.next().value;
  }

  /**
   * Creates instances of dependencies for the modules in the container.
   *
   * @remarks
   * This method is called internally by the {@link E2eTestingModuleBuilder}
   * when building the module.
   *
   * @param graphInspector - The graph inspector to use.
   * @param options - Options for creating instances of dependencies.
   * @returns A promise that resolves when all instances of dependencies have
   * been created.
   */
  private async createInstancesOfDependencies(
    graphInspector: GraphInspector,
    options: { preview?: boolean },
  ) {
    const injector = new TestingInjector({
      preview: options?.preview ?? false,
    });
    const instanceLoader = new TestingInstanceLoader(
      this.container,
      injector,
      graphInspector,
    );
    await instanceLoader.createInstancesOfDependencies(
      this.container.getModules(),
      this.mocker,
    );
  }

  /**
   * Creates a root test module with the given metadata.
   *
   * @remarks
   * This method is used internally by the {@link E2eTestingModuleBuilder}
   * to create the root module that will be used for building the testing
   * module.
   *
   * @param metadata - The metadata for the root test module.
   * @returns The class of the root test module.
   */
  private createModule(metadata: ModuleMetadata) {
    class RootTestModule {}
    Module(metadata)(RootTestModule);
    return RootTestModule;
  }

  /**
   * Sets the logger to use in the testing module.
   *
   * @remarks
   * This method overrides the default logger with a testing logger.
   * If a testing logger is provided, it is used.
   * Otherwise, a default testing logger is used.
   */
  private applyLogger() {
    Logger.overrideLogger(this.testingLogger || new TestingLogger());
  }
}
