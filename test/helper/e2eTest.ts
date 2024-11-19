import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { E2eTestingModuleBuilder } from './e2e-module-builder';
import { AppModule } from '../../src/app.module';

/**
 * A class that provides a static method for creating an instance of
 * `E2eTestingModuleBuilder` with the necessary metadata scanner and
 * application module for setting up the testing module.
 *
 * semilar with the Test class from [@nestjs/testing](https://www.npmjs.com/package/@nestjs/testing)
 */
export class E2eTest {
  private static readonly metadataScanner = new MetadataScanner();

  /**
   * Creates an instance of `E2eTestingModuleBuilder` with the necessary
   * metadata scanner and application module for setting up the testing module.
   *
   * @returns An instance of `E2eTestingModuleBuilder` configured with the
   *          application module.
   */
  public static createTestingModule(): E2eTestingModuleBuilder {
    return new E2eTestingModuleBuilder(this.metadataScanner, {
      imports: [AppModule],
    });
  }
}
