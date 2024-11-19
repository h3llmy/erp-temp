import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import compression from '@fastify/compress';
import { VersioningType } from '@nestjs/common';
import { FormdataInterceptor } from 'nestjs-formdata-interceptor';
import { ValidationErrorHandler } from '../errorHandler/validationErrorHandler';
import { HttpExceptionsFilter } from '../errorHandler/httpErrorHandler';
import { JwtExceptionsFilter } from '../errorHandler/JwtErrorHandler';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ApplicationLogger } from '../logger/loger.interceptor';
import { ConfigService } from '@nestjs/config';

export class ApplicationConfig {
  static setup<T extends NestFastifyApplication>(app: T, routePrefix: string) {
    const configService: ConfigService = app.get(ConfigService);

    app.register(fastifyMultipart);
    app.register(fastifyHelmet);
    app.register(compression);

    app.enableCors({
      origin: '*',
    });

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: ['1'],
      prefix: 'v',
    });

    app.useGlobalInterceptors(
      new FormdataInterceptor({
        customFileName(context, originalFileName) {
          return `${configService.get<string>('NODE_ENV')}/${Date.now()}-${originalFileName}`;
        },
      }),
      new ApplicationLogger(configService),
    );

    app.useGlobalPipes(new ValidationErrorHandler());

    app.useGlobalFilters(new HttpExceptionsFilter(), new JwtExceptionsFilter());

    app.setGlobalPrefix(routePrefix);
  }
}
