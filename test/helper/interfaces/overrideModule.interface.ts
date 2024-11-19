import { ModuleDefinition } from '@nestjs/core/interfaces/module-definition.interface';
import { E2eTestingModuleBuilder } from '../e2e-module-builder';

export interface IE2eOverrideModule {
  useModule: (newModule: ModuleDefinition) => E2eTestingModuleBuilder;
}
