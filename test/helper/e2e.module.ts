import { FastifyAdapter } from '@nestjs/platform-fastify';
import {
  AbstractHttpAdapter,
  ApplicationConfig,
  GraphInspector,
  NestApplication,
  NestApplicationContext,
  NestContainer,
} from '@nestjs/core';
import {
  HttpServer,
  INestApplication,
  Logger,
  NestApplicationOptions,
  Type,
} from '@nestjs/common';
import { Module } from '@nestjs/core/injector/module';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface';

export class E2eTestingModule extends NestApplicationContext {
  protected readonly graphInspector: GraphInspector;
  constructor(
    container: NestContainer,
    graphInspector: GraphInspector,
    contextModule: Module,
    private readonly applicationConfig: ApplicationConfig,
    scope: Type<any>[] = [],
  ) {
    const options = {};
    super(container, options, contextModule, scope);
    this.graphInspector = graphInspector;
  }

  /**
   * Creates a Nest application using the provided httpAdapter and configures
   * it for end-to-end testing. This method sets up the application, creates
   * a Fastify adapter, and adds a shutdown method to the application.
   * @param httpAdapter - The http adapter to use for the application.
   * @param options - Optional configuration for the application context,
   *                  allowing specifying 'snapshot' or 'preview' modes.
   * @returns A promise that resolves to an instance of `INestFastifyE2eApplication`.
   */
  public createNestApplication<T extends INestApplication = INestApplication>(
    httpAdapter: HttpServer | AbstractHttpAdapter,
    options?: NestApplicationOptions,
  ): T;
  public createNestApplication<T extends INestApplication = INestApplication>(
    options?: NestApplicationOptions,
  ): T;
  public createNestApplication<T extends INestApplication = INestApplication>(
    serverOrOptions:
      | HttpServer
      | AbstractHttpAdapter
      | NestApplicationOptions
      | undefined,
    options?: NestApplicationOptions,
  ): T {
    const [httpAdapter, appOptions] = this.isHttpServer(serverOrOptions)
      ? [serverOrOptions, options]
      : [this.createHttpAdapter(), serverOrOptions];

    this.applyLogger(appOptions);
    this.container.setHttpAdapter(httpAdapter);

    const instance = new NestApplication(
      this.container,
      httpAdapter,
      this.applicationConfig,
      this.graphInspector,
      appOptions,
    );
    return this.createAdapterProxy<T>(instance, httpAdapter);
  }

  /**
   * Determines if the provided argument is an instance of `HttpServer` or `AbstractHttpAdapter`.
   *
   * @param serverOrOptions - The argument to check, which can be an instance of `HttpServer`,
   * `AbstractHttpAdapter`, `NestApplicationOptions`, or `undefined`.
   * @returns A boolean indicating whether the argument is an `HttpServer` or `AbstractHttpAdapter`.
   */
  private isHttpServer(
    serverOrOptions:
      | HttpServer
      | AbstractHttpAdapter
      | NestApplicationOptions
      | undefined,
  ): serverOrOptions is HttpServer | AbstractHttpAdapter {
    return !!(serverOrOptions && (serverOrOptions as HttpServer).patch);
  }

  /**
   * Creates an instance of `AbstractHttpAdapter` using the Fastify platform.
   *
   * @param httpServer - Optional HTTP server instance to be used by the Fastify adapter.
   * @returns An instance of `AbstractHttpAdapter` configured with the Fastify adapter.
   */
  private createHttpAdapter<T = any>(httpServer?: T): AbstractHttpAdapter {
    return new FastifyAdapter(httpServer);
  }

  /**
   * Sets the logger to use in the testing module.
   *
   * @remarks
   * This method overrides the default logger with a testing logger.
   * If a testing logger is provided, it is used.
   * Otherwise, a default testing logger is used.
   *
   * @param options - Optional configuration for the application context,
   *                  allowing specifying 'snapshot' or 'preview' modes.
   *                  The 'logger' property in the options is used to set the logger.
   */
  private applyLogger(options: NestApplicationContextOptions | undefined) {
    if (!options || isUndefined(options.logger)) {
      return;
    }
    Logger.overrideLogger(options.logger);
  }

  /**
   * Creates a proxy for the given Nest application, delegating calls to methods
   * of the underlying HTTP server (e.g., Fastify) if not found on the Nest application.
   *
   * @param app The Nest application to proxy.
   * @param adapter The underlying HTTP server adapter.
   * @returns A proxy object for the given Nest application.
   */
  private createAdapterProxy<T>(app: NestApplication, adapter: HttpServer): T {
    return new Proxy(app, {
      get: (receiver: Record<string, any>, prop: string) => {
        if (!(prop in receiver) && prop in adapter) {
          return adapter[prop];
        }
        return receiver[prop];
      },
    }) as any as T;
  }
}
