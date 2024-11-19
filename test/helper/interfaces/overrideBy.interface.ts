import { OverrideByFactoryOptions } from '@nestjs/testing/interfaces/override-by-factory-options.interface';
import { E2eTestingModuleBuilder } from '../e2e-module-builder';
/**
 * @publicApi
 */
export interface IE2eOverrideBy {
  useValue: (value: any) => E2eTestingModuleBuilder;
  useFactory: (options: OverrideByFactoryOptions) => E2eTestingModuleBuilder;
  useClass: (metatype: any) => E2eTestingModuleBuilder;
}
