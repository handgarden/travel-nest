import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
    logger: ['error', 'warn', 'log'],
  });

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;

  await app.listen(port);
}
bootstrap();
