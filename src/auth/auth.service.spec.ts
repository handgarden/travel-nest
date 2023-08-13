import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Test } from '@nestjs/testing';
import { DuplicateAccountException } from '../member/exception/duplicate-account.exception';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MemberService } from 'src/member/member.service';
import { CreateMemberDto } from 'src/member/dto/create-member.dto';
import { DuplicateNicknameException } from 'src/member/exception/duplicate-nickname.exception';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { Member } from 'src/member/entities/member.entity';
import { Role } from 'src/member/enum/Role';
import { JwtPayload } from './dto/jwt.dto';
import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;
  const memberService: Partial<MemberService> = {
    save: jest.fn(),
    findByAccount: jest.fn(),
    validatePassword: jest.fn(),
  };
  const jwtService: Partial<JwtService> = {
    sign: jest.fn(),
  };
  const jwtSecret = 'secret';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: MemberService,
          useValue: memberService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();
    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('가입에 성공하면 회원의 db id를 반환', async () => {
      const spy = jest
        .spyOn(memberService, 'save')
        .mockImplementation(() => Promise.resolve(1));

      const registerDto = new RegisterDto();
      registerDto.account = 'test';
      registerDto.password = 'password';
      registerDto.nickname = 'nickname';
      const result = await service.register(registerDto);
      expect(result).toEqual(1);
      expect(spy).toHaveBeenCalled();
    });

    it('중복된 계정이 존재하면 예외 발생', async () => {
      jest.spyOn(memberService, 'save').mockImplementation(
        (() => {
          const set = new Set<string>();
          let id = 0;
          return (createMemberDto: CreateMemberDto) => {
            if (set.has(createMemberDto.account)) {
              throw new DuplicateAccountException();
            }
            set.add(createMemberDto.account);
            return Promise.resolve(++id);
          };
        })(),
      );
      const registerDto = new RegisterDto();
      registerDto.account = 'test';
      registerDto.password = 'password';
      registerDto.nickname = 'nickname';
      await service.register(registerDto);
      const registerDto2 = new RegisterDto();
      registerDto2.account = registerDto.account;
      registerDto2.password = 'password';
      registerDto2.nickname = 'nickname2';
      await expect(async () => {
        await service.register(registerDto2);
      }).rejects.toThrowError(new DuplicateAccountException());
    });

    it('중복된 닉네임이 존재하면 예외 발생', async () => {
      jest.spyOn(memberService, 'save').mockImplementation(
        (() => {
          const set = new Set<string>();
          let id = 0;
          return (createMemberDto: CreateMemberDto) => {
            if (set.has(createMemberDto.nickname)) {
              throw new DuplicateNicknameException();
            }
            set.add(createMemberDto.nickname);
            return Promise.resolve(++id);
          };
        })(),
      );
      const registerDto = new RegisterDto();
      registerDto.account = 'test';
      registerDto.password = 'password';
      registerDto.nickname = 'nickname';
      await service.register(registerDto);
      const registerDto2 = new RegisterDto();
      registerDto2.account = 'test2';
      registerDto2.password = 'password';
      registerDto2.nickname = registerDto.nickname;
      await expect(async () => {
        await service.register(registerDto2);
      }).rejects.toThrowError(new DuplicateNicknameException());
    });

    it('나머지 예외는 InternalServerException', async () => {
      jest.spyOn(memberService, 'save').mockImplementation(() => {
        throw new InternalServerErrorException();
      });
      const registerDto = new RegisterDto();
      registerDto.account = 'test';
      registerDto.password = 'password';
      registerDto.nickname = 'nickname';
      await expect(async () => {
        await service.register(registerDto);
      }).rejects.toThrowError(new InternalServerErrorException());
    });
  });

  describe('login', () => {
    it('계정이 정해진 정규 표현식에 맞지 않으면 예외를 던진다.', async () => {
      const loginDto: LoginDto = {
        account: '123',
        password: 'password1234!',
      };

      expect(async () => await service.login(loginDto)).rejects.toThrowError(
        new BadRequestException(),
      );
    });

    it('비밀번호가 정해진 정규 표현식에 맞지 않으면 예외를 던진다.', async () => {
      const loginDto: LoginDto = {
        account: 'testAccount',
        password: '123',
      };

      expect(async () => await service.login(loginDto)).rejects.toThrowError(
        new BadRequestException(),
      );
    });

    it('로그인하려는 계정에 해당하는 회원이 없으면 에외를 던진다.', async () => {
      jest
        .spyOn(memberService, 'findByAccount')
        .mockImplementation((account: string) => {
          if (account !== 'correctAccount') {
            throw new BadRequestException();
          }

          return Promise.resolve(new Member());
        });
      const loginDto: LoginDto = {
        account: 'testAccount',
        password: 'password1234!',
      };

      expect(async () => await service.login(loginDto)).rejects.toThrowError(
        new BadRequestException(),
      );
    });

    it('비밀번호가 검증되지 않으면 예외를 던진다.', async () => {
      jest
        .spyOn(memberService, 'findByAccount')
        .mockImplementation((account: string) => {
          const member = new Member();
          member.account = account;
          member.password = 'password1234!!!!';
          return Promise.resolve(member);
        });

      jest
        .spyOn(memberService, 'validatePassword')
        .mockReturnValue(Promise.resolve(false));

      const loginDto: LoginDto = {
        account: 'testAccount',
        password: 'password1234!',
      };

      expect(async () => await service.login(loginDto)).rejects.toThrowError(
        new BadRequestException(),
      );
    });

    it('검증을 통과하고 로그인에 성공하면 jwt 토큰을 반환한다.', async () => {
      jest
        .spyOn(memberService, 'findByAccount')
        .mockImplementation(async (account: string) => {
          const member = new Member();
          member.id = 1;
          member.account = account;
          member.password = 'password1234!';
          member.nickname = 'nickname';
          member.role = Role.USER;
          return Promise.resolve(member);
        });

      jest
        .spyOn(memberService, 'validatePassword')
        .mockReturnValue(Promise.resolve(true));

      jest
        .spyOn(jwtService, 'sign')
        .mockImplementation((payload: JwtPayload) => {
          return jwt.sign(payload, jwtSecret);
        });

      const loginDto: LoginDto = {
        account: 'testAccount',
        password: 'password1234!',
      };

      const { accessToken } = await service.login(loginDto);

      const payload = jwt.verify(
        accessToken,
        jwtSecret,
      ) as unknown as JwtPayload;

      expect(payload.sub).toEqual(1);
      expect(payload.nickname).toEqual('nickname');
      expect(payload.role).toEqual(Role.USER);
    });
  });
});
