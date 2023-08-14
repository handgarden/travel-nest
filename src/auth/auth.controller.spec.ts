import { LoginRequest } from './dto/login-request.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterRequest } from './dto/register-request.dto';
import { Role } from 'src/member/enum/Role';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from './dto/jwt.dto';

describe('AuthController', () => {
  let controller: AuthController;
  const authService: Partial<AuthService> = {
    login: jest.fn(),
    register: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('회원가입 성공 시 id 반환', async () => {
      jest
        .spyOn(authService, 'register')
        .mockImplementation(() => Promise.resolve(1));

      const registerDto = new RegisterRequest();
      registerDto.account = 'test';
      registerDto.password = 'password1234!';
      registerDto.nickname = 'nickname';

      const id = await controller.register(registerDto);
      expect(id).toEqual(1);
    });
  });
  describe('login', () => {
    it('로그인 성공 시 jwt 반환', async () => {
      jest.spyOn(authService, 'login').mockImplementation(() => {
        const jwtPayload: JwtPayload = {
          sub: 1,
          nickname: 'nickname',
          role: Role.USER,
        };
        return Promise.resolve({
          accessToken: jwt.sign(jwtPayload, 'secret'),
          profile: {
            nickname: jwtPayload.nickname,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      });

      const loginDto = new LoginRequest();
      loginDto.account = 'test';
      loginDto.password = 'qwer1234';
      const { accessToken, profile } = await controller.login(loginDto);
      const parsedPayload = jwt.verify(accessToken, 'secret');
      delete parsedPayload['iat'];
      expect(parsedPayload).toEqual({
        sub: 1,
        nickname: 'nickname',
        role: Role.USER,
      });
      expect(profile.nickname).toEqual('nickname');
    });
  });
});
