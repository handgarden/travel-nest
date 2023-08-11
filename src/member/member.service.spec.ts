import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateMemberDto } from './dto/create-member.dto';
import { DuplicateAccountException } from './exception/DuplicateAccount.exception';
import { DuplicateNicknameException } from './exception/DuplicateNickname.exception';
import { InternalServerErrorException } from '@nestjs/common';
import { Role } from './enum/Role';

describe('MemberService', () => {
  let service: MemberService;
  let repository: Repository<Member>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: getRepositoryToken(Member),
          useValue: {
            save: jest.fn(),
            findOneBy: jest.fn(),
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

    it('나머지 예외는 InternalServerException', async () => {
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
      }).rejects.toThrowError(new InternalServerErrorException());
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
});
