import { AuthService } from './auth.service';
import { QueryFailedError, Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { Member } from 'src/member/entities/member.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DuplicateAccountException } from './exception/DuplicateAccount.exception';
import { DuplicateNicknameException } from './exception/DuplicateNickname.exception';
import { InternalServerErrorException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  const mockMemberRepository: Partial<Repository<Member>> = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepository,
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
        .spyOn(mockMemberRepository, 'save')
        .mockImplementation((member: Member) =>
          Promise.resolve({ ...member, id: 1 }),
        );

      const registerDto = new RegisterDto();
      registerDto.account = 'test';
      registerDto.password = 'password';
      registerDto.nickname = 'nickname';
      const result = await service.register(registerDto);
      expect(result).toEqual(1);
      expect(spy).toHaveBeenCalled();
    });

    it('중복된 계정이 존재하면 예외 발생', async () => {
      jest.spyOn(mockMemberRepository, 'save').mockImplementation(
        (() => {
          const set = new Set<string>();
          return (member: Member) => {
            if (set.has(member.account)) {
              throw new QueryFailedError('', [], { message: 'UNIQUE account' });
            }
            set.add(member.account);
            return Promise.resolve({ ...member, id: 1 });
          };
        })(),
      );
      const registerDto = new RegisterDto();
      registerDto.account = 'test';
      registerDto.password = 'password';
      registerDto.nickname = 'nickname';
      await service.register(registerDto);
      const registerDto2 = new RegisterDto();
      registerDto2.account = 'test';
      registerDto2.password = 'password';
      registerDto2.nickname = 'nickname2';
      await expect(async () => {
        await service.register(registerDto2);
      }).rejects.toThrowError(new DuplicateAccountException());
    });

    it('중복된 닉네임이 존재하면 예외 발생', async () => {
      jest.spyOn(mockMemberRepository, 'save').mockImplementation(
        (() => {
          const set = new Set<string>();
          return (member: Member) => {
            if (set.has(member.nickname)) {
              throw new QueryFailedError('', [], {
                message: 'UNIQUE nickname',
              });
            }
            set.add(member.nickname);
            return Promise.resolve({ ...member, id: 1 });
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
      registerDto2.nickname = 'nickname';
      await expect(async () => {
        await service.register(registerDto2);
      }).rejects.toThrowError(new DuplicateNicknameException());
    });

    it('나머지 예외는 InternalServerException', async () => {
      jest.spyOn(mockMemberRepository, 'save').mockImplementation(() => {
        throw new QueryFailedError('', [], {
          message: 'error',
        });
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
