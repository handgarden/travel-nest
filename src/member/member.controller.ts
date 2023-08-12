import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { Authorization } from 'src/auth/decorator/authorization.decorator';
import { JwtMember } from 'src/auth/decorator/jwt-member.decorator';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('member')
@Authorization()
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  async getProfile(@JwtMember() member: JwtMemberDto) {
    return this.memberService.getProfile(member.id);
  }

  @Post('nickname')
  @HttpCode(HttpStatus.OK)
  async updateNickname(
    @JwtMember() member: JwtMemberDto,
    @Body('nickname') updateNickname: string,
  ) {
    if (member.nickname === updateNickname) {
      return 'success';
    }

    await this.memberService.updateNickname(member.id, updateNickname);

    return 'success';
  }

  @Post('password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @JwtMember() member: JwtMemberDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.memberService.updatePassword(member.id, updatePasswordDto);

    return 'success';
  }
}
