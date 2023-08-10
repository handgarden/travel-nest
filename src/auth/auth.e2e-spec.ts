import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from 'src/config/configuration';
import { Member } from 'src/member/entities/member.entity';
import * as request from 'supertest';
import { RegisterDto } from './dto/register.dto';

describe('auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: process.env.NODE_ENV
            ? `.env.${process.env.NODE_ENV}`
            : '.env.test',
          load: [configuration],
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) =>
            configService.get('TypeOrmModuleOptions'),
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Member]),
        AuthModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    // app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  it('/POST register', () => {
    const registerDto = new RegisterDto();
    registerDto.account = 'test';
    registerDto.nickname = 'nickname';
    registerDto.password = 'password';
    return request(app.getHttpServer())
      .post('/auth/register')
      .type('application/json')
      .send(registerDto)
      .expect(201);
  });
});
