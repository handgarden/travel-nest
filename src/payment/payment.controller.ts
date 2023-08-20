import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Authorization } from 'src/auth/decorator/authorization.decorator';
import { JwtMember } from 'src/auth/decorator/jwt-member.decorator';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { CreateCreditCardRequest } from './dto/create-credit-card-reqeust.dto';

@Controller('payment')
@Authorization()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  createCreditCard(
    @JwtMember() member: JwtMemberDto,
    @Body() createCardDto: CreateCreditCardRequest,
  ) {
    const mockBalance = 20000 + Math.floor(Math.random() * 80000);
    return this.paymentService.createCreditCard(
      member.id,
      createCardDto,
      mockBalance,
    );
  }

  @Delete(':id')
  deleteCreditCard(
    @JwtMember() member: JwtMemberDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentService.deleteCreditCard(member.id, id);
  }

  @Post('deposit')
  depositToTravelPay(
    @JwtMember() member: JwtMemberDto,
    @Body('depositAmount', ParseIntPipe) amount: number,
  ) {
    if (amount % 1000 !== 0) {
      throw new BadRequestException('1000원 단위로만 충전 가능합니다.');
    }

    return this.paymentService.depositToTravelPay(member.id, amount);
  }

  @Get()
  findAll(@JwtMember() member: JwtMemberDto) {
    return this.paymentService.findAll(member.id);
  }
}
