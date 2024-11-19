import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import redisStore from 'cache-manager-redis-store';

export const cacheModuleConfig: CacheModuleAsyncOptions = {
  inject: [ConfigService],
  isGlobal: true,
  useFactory: async (config: ConfigService) => {
    const isTestEnv = config.get('NODE_ENV') === 'test';

    // Conditionally set the store based on the environment
    const store = isTestEnv ? undefined : redisStore;

    return {
      store, // Redis store or memory store in test environment
      host: isTestEnv
        ? undefined
        : config.get<string>('REDIS_HOST', 'localhost'),
      port: isTestEnv ? undefined : config.get<number>('REDIS_PORT', 6379),
      password: isTestEnv
        ? undefined
        : config.get<string>('REDIS_PASSWORD', ''),
    };
  },
};
