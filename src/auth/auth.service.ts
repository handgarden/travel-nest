import { MemberService } from './../member/member.service';
import { RegisterDto } from './dto/register.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { NUM_AND_ALPHABET_ONLY, PASSWORD_REGEX } from './lib/regex';
import { LoginDto } from './dto/login.dto';
import { CreateMemberDto } from 'src/member/dto/create-member.dto';

@Injectable()
export class AuthService {
  constructor(private memberService: MemberService) {}

  /**
   * 회원 가입
   * @param registerDto 계정 & 비밀번호 & 닉네임
   * @returns
   */
  async register(registerDto: RegisterDto): Promise<number> {
    const createMemberDto = new CreateMemberDto();
    createMemberDto.account = registerDto.account;
    createMemberDto.nickname = registerDto.nickname;
    createMemberDto.hashedPassword = await bcrypt.hash(
      registerDto.password,
      10,
    );

    return this.memberService.save(createMemberDto);
  }

  /**
   * 로그인
   * @param loginDto 계정 & 비밀번호
   */
  async login(loginDto: LoginDto) {
    this.validateLoginInfo(loginDto.account, loginDto.password);

    const member = await this.memberService.findByAccount(loginDto.account);

    if (!member) {
      throw new NotFoundException();
    }

    if (await this.validatePassword(loginDto.password, member.password)) {
      throw new NotFoundException();
    }
  }

  private validateLoginInfo(account: string, password: string) {
    if (!NUM_AND_ALPHABET_ONLY.test(account)) {
      throw new NotFoundException();
    }

    if (!PASSWORD_REGEX.test(password)) {
      throw new NotFoundException();
    }
  }

  private validatePassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }
}
