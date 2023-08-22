import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ResponseTemplateInterceptor } from './response-template.interceptor';
import { ErrorResponseFilter } from './error-response.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
    logger: ['error', 'warn', 'log'],
  });

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalInterceptors(new ResponseTemplateInterceptor());

  app.useGlobalFilters(new ErrorResponseFilter());

  const port = process.env.PORT || 3000;

  app.enableCors({
    origin: [process.env.CORS_URL],
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
    preflightContinue: false,
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();
