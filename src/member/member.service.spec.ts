import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import {
  FindOptionsWhere,
  QueryFailedError,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateMemberDto } from './dto/create-member.dto';
import { DuplicateAccountException } from './exception/DuplicateAccount.exception';
import { DuplicateNicknameException } from './exception/DuplicateNickname.exception';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from './enum/Role';
import * as bcrypt from 'bcrypt';

describe('MemberService', () => {
  let service: MemberService;
  let repository: Repository<Member>;

  const generateMember = async (
    id: number,
    account?: string,
    password?: string,
    nickname?: string,
  ) => {
    const member = new Member();
    member.id = id;
    member.account = account || 'account';
    member.nickname = nickname || 'nickname';
    member.role = Role.USER;
    member.password = password || bcrypt.hashSync('password', 10);

    return member;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: getRepositoryToken(Member),
          useValue: {
            getDb: jest.fn().mockImplementation(() => {
              const set = new Set<Member>();
              return () => set;
            }),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
    repository = module.get<Repository<Member>>(getRepositoryToken(Member));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('save', () => {
    it('저장에 성공하면 PK id를 포함한 멤버 엔티티 반환', async () => {
      const spy = jest
        .spyOn(repository, 'save')
        .mockImplementation((member: Member) =>
          Promise.resolve({ ...member, id: 1 }),
        );

      const createMemberDto = new CreateMemberDto();
      createMemberDto.account = 'test';
      createMemberDto.hashedPassword = 'password';
      createMemberDto.nickname = 'nickname';
      const result = await service.save(createMemberDto);
      expect(result).toEqual(1);
      expect(spy).toHaveBeenCalled();
    });

    it('중복된 계정이 존재하면 예외 발생', async () => {
      jest.spyOn(repository, 'save').mockImplementation(
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
      const createMemberDto = new CreateMemberDto();
      createMemberDto.account = 'test';
      createMemberDto.hashedPassword = 'password';
      createMemberDto.nickname = 'nickname';
      service.save(createMemberDto);
      const createMemberDto2 = new CreateMemberDto();
      createMemberDto2.account = createMemberDto.account;
      createMemberDto2.hashedPassword = 'password';
      createMemberDto2.nickname = 'nickname2';
      await expect(async () => {
        await service.save(createMemberDto2);
      }).rejects.toThrowError(new DuplicateAccountException());
    });

    it('중복된 닉네임이 존재하면 예외 발생', async () => {
      jest.spyOn(repository, 'save').mockImplementation(
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
      const createMemberDto = new CreateMemberDto();
      createMemberDto.account = 'test';
      createMemberDto.hashedPassword = 'password';
      createMemberDto.nickname = 'nickname';
      service.save(createMemberDto);
      const createMemberDto2 = new CreateMemberDto();
      createMemberDto2.account = 'test2';
      createMemberDto2.hashedPassword = 'password';
      createMemberDto2.nickname = createMemberDto.nickname;
      await expect(async () => {
        await service.save(createMemberDto2);
      }).rejects.toThrowError(new DuplicateNicknameException());
    });

    it('나머지 예외는 그대로 전파', async () => {
      jest.spyOn(repository, 'save').mockImplementation(() => {
        throw new QueryFailedError('', [], {
          message: 'error',
        });
      });
      const createMemberDto = new CreateMemberDto();
      createMemberDto.account = 'test';
      createMemberDto.hashedPassword = 'password';
      createMemberDto.nickname = 'nickname';
      await expect(async () => {
        await service.save(createMemberDto);
      }).rejects.toThrowError(QueryFailedError);
    });
  });

  describe('findByAccount', () => {
    it('계정에 해당하는 회원이 존재하면 반환', async () => {
      jest.spyOn(repository, 'findOneBy').mockImplementation(() => {
        const member = new Member();
        member.id = 1;
        member.account = 'test';
        member.password = 'password';
        member.nickname = 'nickname';
        member.role = Role.USER;
        return Promise.resolve(member);
      });

      const member = await service.findByAccount('test');

      expect(member).toEqual({
        id: 1,
        account: 'test',
        password: 'password',
        nickname: 'nickname',
        role: Role.USER,
      });
    });

    it('계정에 해당하는 회원이 없으면 null 반환', async () => {
      jest.spyOn(repository, 'findOneBy').mockImplementation(() => {
        return Promise.resolve(null);
      });

      const member = await service.findByAccount('test');
      expect(member).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('정상 요청시 회원 프로필 정보 반환', async () => {
      jest
        .spyOn(repository, 'findOneBy')
        .mockImplementation(
          async (option: Partial<FindOptionsWhere<Member>>) => {
            const member = generateMember(option.id as number);

            return Promise.resolve(member);
          },
        );
      const profile = await service.getProfile(1);

      expect(profile).toEqual({ nickname: 'nickname' });
    });

    it('없는 회원 요청시 NotFoundException', async () => {
      jest
        .spyOn(repository, 'findOneBy')
        .mockImplementation(() => Promise.resolve(null));

      expect(async () => await service.getProfile(1)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('updateNickname', () => {
    it('정상 처리 시 반환 없음', () => {
      const spy = jest
        .spyOn(repository, 'findOneBy')
        .mockReturnValue(Promise.resolve(generateMember(1)));

      jest
        .spyOn(repository, 'update')
        .mockReturnValue(Promise.resolve(new UpdateResult()));

      service.updateNickname(1, 'nickname');
      expect(spy).toBeCalled();
    });

    it('변경하려는 회원이 존재하지 않으면 NotFoundException', () => {
      const spy = jest.spyOn(repository, 'findOneBy').mockReturnValue(null);

      expect(
        async () => await service.updateNickname(1, 'nickname'),
      ).rejects.toThrowError(NotFoundException);
      expect(spy).toBeCalled();
    });

    it('DB에서 닉네임 중복 예외 발생시 DuplicateNicknameException', () => {
      jest
        .spyOn(repository, 'findOneBy')
        .mockReturnValue(Promise.resolve(generateMember(1)));

      jest
        .spyOn(repository, 'update')
        .mockRejectedValue(
          new QueryFailedError('', [], { message: 'UNIQUE nickname' }),
        );

      expect(
        async () => await service.updateNickname(1, 'nickname'),
      ).rejects.toThrowError(DuplicateNicknameException);
    });
  });

  describe('updatePassword', () => {
    it('정상 처리 시 반환 없음', () => {
      const member = generateMember(1);
      const spy = jest
        .spyOn(repository, 'findOneBy')
        .mockReturnValue(Promise.resolve(member));

      jest.spyOn(repository, 'save').mockReturnValue(Promise.resolve(member));

      jest
        .spyOn(repository, 'update')
        .mockReturnValue(Promise.resolve(new UpdateResult()));

      service.updatePassword(1, {
        prevPassword: 'password',
        newPassword: 'newPassword',
      });
      expect(spy).toBeCalled();
    });

    it('변경하려는 회원이 존재하지 않으면 NotFoundException', () => {
      const spy = jest.spyOn(repository, 'findOneBy').mockReturnValue(null);

      expect(
        async () =>
          await service.updatePassword(1, {
            prevPassword: 'password',
            newPassword: 'newPassword',
          }),
      ).rejects.toThrowError(NotFoundException);
      expect(spy).toBeCalled();
    });

    it('이전 비밀번호가 맞지 않으면 BadRequestException', () => {
      jest
        .spyOn(repository, 'findOneBy')
        .mockReturnValue(Promise.resolve(generateMember(1)));

      expect(
        async () =>
          await service.updatePassword(1, {
            prevPassword: 'prevPassword',
            newPassword: 'newPassword',
          }),
      ).rejects.toThrowError(BadRequestException);
    });
  });
});
