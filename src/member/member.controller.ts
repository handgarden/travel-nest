import { Controller, Get, Req } from '@nestjs/common';
import { MemberService } from './member.service';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  getProfile(@Req() req) {
    return req.user;
  }
}
