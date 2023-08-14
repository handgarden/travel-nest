import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import configuration from 'src/config/configuration';
import { Member } from 'src/member/entities/member.entity';
import * as request from 'supertest';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';

describe('auth', () => {
  let app: INestApplication;
  let service: AuthService;
  let memberRepository: Repository<Member>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: process.env.NODE_ENV
            ? `.env.${process.env.NODE_ENV}`
            : '.env.test',
          load: [configuration],
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) =>
            configService.get('TypeOrmModuleOptions'),
          inject: [ConfigService],
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    service = moduleRef.get<AuthService>(AuthService);
    memberRepository = moduleRef.get<Repository<Member>>(
      getRepositoryToken(Member),
    );

    // app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterEach(async () => {
    await memberRepository.clear();
  });

  it('/POST register', () => {
    const registerDto = new RegisterDto();
    registerDto.account = 'testAccount';
    registerDto.nickname = 'nickname';
    registerDto.password = 'password1234!';
    return request(app.getHttpServer())
      .post('/auth/register')
      .type('application/json')
      .send(registerDto)
      .expect(201);
  });

  it('/POST login', async () => {
    const registerDto = new RegisterDto();
    registerDto.account = 'test';
    registerDto.nickname = 'nickname';
    registerDto.password = 'password1234!';
    await service.register(registerDto);

    const loginDto = new LoginDto();
    loginDto.account = registerDto.account;
    loginDto.password = registerDto.password;
    return request(app.getHttpServer())
      .post('/auth/login')
      .type('application/json')
      .send(loginDto)
      .expect(200);
  });
});
