import { CreateMemberDto } from './dto/create-member.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Member } from './entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Role } from './enum/Role';
import { DuplicateAccountException } from './exception/duplicate-account.exception';
import { DuplicateNicknameException } from './exception/duplicate-nickname.exception';
import { MemberProfile } from './dto/member-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { ResourceNotFoundException } from 'src/exception/resource-not-found.exception';
import { QueryNotAffectedException } from 'src/exception/query-not-affected.exception';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member) private memberRepository: Repository<Member>,
  ) {}

  async save(createMemberDto: CreateMemberDto) {
    const member = new Member();

    member.account = createMemberDto.account;
    member.password = await bcrypt.hash(createMemberDto.password, 10);
    member.nickname = createMemberDto.nickname;
    member.role = Role.USER;

    try {
      return (await this.memberRepository.save(member)).id;
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const message = err.message;

        if (message.includes('UNIQUE') && message.includes('account')) {
          throw new DuplicateAccountException();
        }

        if (message.includes('UNIQUE') && message.includes('nickname')) {
          throw new DuplicateNicknameException();
        }
      }

      throw err;
    }
  }

  findByAccount(account: string) {
    return this.memberRepository.findOneBy({
      account,
    });
  }

  async getProfile(id: number) {
    const member = await this.memberRepository.findOneBy({ id });

    if (!member) {
      throw new ResourceNotFoundException();
    }

    const profile = new MemberProfile();

    profile.nickname = member.nickname;
    profile.createdAt = member.createdAt;
    profile.updatedAt = member.updatedAt;

    return profile;
  }

  async updateNickname(id: number, nickname: string) {
    const member = await this.memberRepository.findOneBy({ id });

    if (!member) {
      throw new ResourceNotFoundException();
    }

    member.nickname = nickname;

    try {
      const result = await this.memberRepository.update(
        { id: member.id },
        { nickname },
      );

      if (!result.affected || result.affected < 1) {
        throw new QueryNotAffectedException();
      }
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const message = err.message;

        if (message.includes('UNIQUE') && message.includes('nickname')) {
          throw new DuplicateNicknameException();
        }
      }

      throw err;
    }
  }

  async updatePassword(id: number, passwordDto: UpdatePasswordDto) {
    const member = await this.memberRepository.findOneBy({ id });

    if (!member) {
      throw new ResourceNotFoundException();
    }

    if (
      !(await this.validatePassword(passwordDto.prevPassword, member.password))
    ) {
      throw new BadRequestException();
    }

    if (passwordDto.prevPassword === passwordDto.newPassword) {
      return;
    }

    const encryptedPassword = await bcrypt.hash(passwordDto.newPassword, 10);

    await this.memberRepository.update({ id }, { password: encryptedPassword });
  }

  async validatePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
}
