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
import { UpdatePasswordRequest } from './dto/update-password-request.dto';
import { BasicResponseMessage } from 'src/common/basic-response.enum';
import { UpdateNicknameRequest } from './dto/update-nickname-request.dto';

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
    @Body() updateNicknameDto: UpdateNicknameRequest,
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
    @Body() updatePasswordDto: UpdatePasswordRequest,
  ) {
    await this.memberService.updatePassword(member.id, updatePasswordDto);

    return BasicResponseMessage.SUCCESS;
  }
}
