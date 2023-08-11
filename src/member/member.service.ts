import { CreateMemberDto } from './dto/create-member.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Member } from './entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Role } from './enum/Role';
import { DuplicateAccountException } from './exception/DuplicateAccount.exception';
import { DuplicateNicknameException } from './exception/DuplicateNickname.exception';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member) private memberRepository: Repository<Member>,
  ) {}

  async save(createMemberDto: CreateMemberDto) {
    const member = new Member();

    member.account = createMemberDto.account;
    member.password = createMemberDto.hashedPassword;
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

      throw new InternalServerErrorException();
    }
  }

  findByAccount(account: string) {
    return this.memberRepository.findOneBy({
      account,
    });
  }
}
