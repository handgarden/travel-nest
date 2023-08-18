import { UpdatePasswordRequest } from './dto/update-password-request.dto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
import { ResponseTemplateInterceptor } from 'src/response-template.interceptor';
import { DefaultResponseMessage } from 'src/common/basic-response.enum';
import { UpdateNicknameRequest } from './dto/update-nickname-request.dto';

describe('member', () => {
  let app: INestApplication;
  let repository: Repository<Member>;
  let service: MemberService;
  let jwtService: JwtService;
  let jwt: string;
  let memberId: number;
  const AUTH_HEADER = 'Authorization';

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

    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new ResponseTemplateInterceptor());

    await app.init();
  });

  beforeEach(async () => {
    repository.clear();
    const createMemberDto = new CreateMemberDto();
    createMemberDto.account = 'account';
    createMemberDto.password = 'password1234!';
    createMemberDto.nickname = 'nickname';
    memberId = await service.save(createMemberDto);
    const payload = {
      sub: memberId,
      nickname: createMemberDto.nickname,
      role: Role.USER,
    };
    jwt = jwtService.sign(payload);
  });

  //프로필 조회
  it('GET /', async () => {
    const res = await request(app.getHttpServer())
      .get('/members')
      .set(AUTH_HEADER, `bearer ${jwt}`)
      .accept('application/json')
      .send()
      .expect(200);
    const body = res.body;
    expect(body.response.nickname).toEqual('nickname');
  });

  //닉네임 변경
  it('POST /nickname', async () => {
    const nicknameDto = new UpdateNicknameRequest('newNickname');
    const res = await request(app.getHttpServer())
      .post('/members/nickname')
      .set(AUTH_HEADER, `bearer ${jwt}`)
      .type('application/json')
      .accept('application/json')
      .send(nicknameDto)
      .expect(200);

    const body = res.body;
    expect(body).toEqual({
      success: true,
      response: DefaultResponseMessage.SUCCESS,
      error: null,
    });

    const member = await service.getProfile(memberId);
    expect(member.nickname).toEqual('newNickname');
  });

  it('POST /password', async () => {
    const passwordDto = new UpdatePasswordRequest(
      'password1234!',
      'newPassword1234!',
    );
    const res = await request(app.getHttpServer())
      .post('/members/password')
      .set(AUTH_HEADER, `bearer ${jwt}`)
      .type('application/json')
      .accept('application/json')
      .send(passwordDto)
      .expect(200);

    const body = res.body;
    expect(body).toEqual({
      success: true,
      response: DefaultResponseMessage.SUCCESS,
      error: null,
    });
  });
});
