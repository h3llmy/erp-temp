import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ApplicationAdapter, SwaggerConfig } from '@libs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ApplicationConfig } from 'libs/common/src/appConfig/appConfig';

(async () => {
  const routePrefix: string = 'api';
  const logger: Logger = new Logger('NestApplication', {
    timestamp: true,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new ApplicationAdapter(),
  );

  const configService: ConfigService = app.get(ConfigService);

  const port: number = configService.get<number>('PORT', 3000);

  ApplicationConfig.setup(app, routePrefix);

  SwaggerConfig.setup({
    prefix: routePrefix,
    app,
  });

  await app.listen(port, '0.0.0.0', async () => {
    const appUrl = await app.getUrl();
    logger.log(`Nest application run on ${appUrl}`);
    logger.log(`Nest documentation available on ${appUrl}/${routePrefix}/docs`);
  });

  app.enableShutdownHooks();
})();
