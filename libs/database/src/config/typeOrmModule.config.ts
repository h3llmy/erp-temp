import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

/**
 * Creates a TypeORM configuration object using the given ConfigService.
 *
 * @param configService The ConfigService instance.
 * @returns A TypeORM configuration object.
 */
function createTypeOrmConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: configService.get<string>('POSTGRES_HOST', 'localhost'),
    port: configService.get<number>('POSTGRES_PORT', 5432),
    username: configService.get<string>('POSTGRES_USER', 'user'),
    password: configService.get<string>('POSTGRES_PASSWORD', ''),
    database: configService.get<string>('POSTGRES_DB', ''),
    autoLoadEntities: true,
    synchronize:
      configService.get<string>('RUN_MIGRATIONS', 'false') === 'true',
    ssl:
      configService.get<string>('POSTGRES_SSL', 'false') === 'true'
        ? { rejectUnauthorized: false }
        : false,
    logging: configService.get<string>('POSTGRES_LOGGING', 'false') === 'true',
  };
}

/**
 * Configuration for TypeORM with async entities for the application connection
 */
export const typeOrmModuleConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions =>
    createTypeOrmConfig(configService),
};

/**
 * Configuration for TypeORM with async entities for seeders
 */
export const typeOrmModuleSeederConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    const entities =
      configService.get<string>('NODE_ENV') === 'production'
        ? '**/*.entity.js'
        : '**/*.entity.ts';
    return {
      ...createTypeOrmConfig(configService),
      entities: [entities],
    };
  },
};
