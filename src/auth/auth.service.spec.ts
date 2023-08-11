import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { Test } from '@nestjs/testing';
import { DuplicateAccountException } from '../member/exception/DuplicateAccount.exception';
import { InternalServerErrorException } from '@nestjs/common';
import { MemberService } from 'src/member/member.service';
import { CreateMemberDto } from 'src/member/dto/create-member.dto';
import { DuplicateNicknameException } from 'src/member/exception/DuplicateNickname.exception';

describe('AuthService', () => {
  let service: AuthService;
  let memberService: MemberService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: MemberService,
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();
    service = moduleRef.get<AuthService>(AuthService);
    memberService = moduleRef.get<MemberService>(MemberService);
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
});
