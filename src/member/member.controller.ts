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
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { BasicResponseMessage } from 'src/lib/basic-response.enum';

@Authorization()
@Controller('members')
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
    @Body() updateNicknameDto: UpdateNicknameDto,
  ) {
    if (member.nickname === updateNicknameDto.nickname) {
      return BasicResponseMessage.SUCCESS;
    }

    await this.memberService.updateNickname(
      member.id,
      updateNicknameDto.nickname,
    );

    return BasicResponseMessage.SUCCESS;
  }

  @Post('password')
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @JwtMember() member: JwtMemberDto,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.memberService.updatePassword(member.id, updatePasswordDto);

    return BasicResponseMessage.SUCCESS;
  }
}
