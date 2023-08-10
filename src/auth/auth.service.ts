import { RegisterDto } from './dto/register.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/member/enum/Role';
import { DuplicateAccountException } from 'src/auth/exception/DuplicateAccount.exception';
import { DuplicateNicknameException } from 'src/auth/exception/DuplicateNickname.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/member/entities/member.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Member) private memberRepository: Repository<Member>,
  ) {}
  async register(registerDto: RegisterDto) {
    const member = new Member();

    member.account = registerDto.account;
    member.password = await bcrypt.hash(registerDto.password, 10);
    member.nickname = registerDto.nickname;
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
}
