import { JwtPayload } from './../../dist/auth/dto/jwt.dto.d';
import { LoginDto } from './dto/login.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Role } from 'src/member/enum/Role';
import * as jwt from 'jsonwebtoken';

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

      const registerDto = new RegisterDto();
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
        });
      });

      const loginDto = new LoginDto();
      loginDto.account = 'test';
      loginDto.password = 'qwer1234';
      const token = await controller.login(loginDto);
      const parsedPayload = jwt.verify(token.accessToken, 'secret');
      delete parsedPayload['iat'];
      expect(parsedPayload).toEqual({
        sub: 1,
        nickname: 'nickname',
        role: Role.USER,
      });
    });
  });
});
