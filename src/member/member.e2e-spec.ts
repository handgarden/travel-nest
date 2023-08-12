import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MemberModule } from './member.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { Role } from './enum/Role';
import * as request from 'supertest';
import { MemberProfile } from './dto/member-profile.dto';

describe('member', () => {
  let app: INestApplication;
  let repository: Repository<Member>;
  let service: MemberService;
  let jwtService: JwtService;
  let jwt: string;

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
        MemberModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    repository = moduleRef.get<Repository<Member>>(getRepositoryToken(Member));
    service = moduleRef.get<MemberService>(MemberService);
    jwtService = moduleRef.get<JwtService>(JwtService);

    await app.init();
  });

  beforeEach(() => {
    repository.clear();
    const createMemberDto = new CreateMemberDto();
    createMemberDto.account = 'account';
    createMemberDto.password = 'password1234!';
    createMemberDto.nickname = 'nickname';
    const id = await service.save(createMemberDto);
    const payload = {
      sub: id,
      nickname: createMemberDto.nickname,
      role: Role.USER,
    };
    jwt = jwtService.sign(payload);
  });

  it('GET /', async () => {
    const res = await request(app.getHttpServer())
      .get('/members')
      .set('Authorization', `bearer ${jwt}`)
      .accept('application/json')
      .send()
      .expect(200);
    const body = res.body as MemberProfile;
    expect(body.nickname).toEqual('nickname');
  });
});
