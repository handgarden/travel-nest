import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { Authorization } from 'src/auth/decorator/authorization.decorator';
import { JwtMember } from 'src/auth/decorator/jwt-member.decorator';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { ValidateDatePipe } from 'src/common/pipe/validate-date.pipe';
import { InvalidReservationDateException } from './exception/invalid-reservation-date.exception';
import { ReserveRoomRequest } from './dto/reserve-room-request.dto';
import { ReserveRoomDto } from './dto/reserve-room.dto';
import * as moment from 'moment';
import { DateFormat } from 'src/common/date-format';
import { PageRequest } from 'src/common/decorator/pageRequest.decorator';
import { Pageable } from 'src/common/pageable.dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('item')
  @Authorization()
  create(
    @JwtMember() member: JwtMemberDto,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.create(member, createRoomDto);
  }

  @Get('/destination/:id')
  findAll(
    @Param('id', ParseIntPipe) destinationId,
    @Query('start', ValidateDatePipe) startDate: string,
    @Query('end', ValidateDatePipe) endDate: string,
  ) {
    const dates = this.validateReservationDate(startDate, endDate);
    return this.roomService.findAll(destinationId, dates.start, dates.end);
  }

  @Get('item/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findOne(id);
  }

  @Post('item/:id')
  @Authorization()
  async reserve(
    @Param('id', ParseIntPipe) roomId: number,
    @JwtMember() member: JwtMemberDto,
    @Body() dto: ReserveRoomRequest,
  ) {
    const dates = this.validateReservationDate(dto.startDate, dto.endDate);
    await this.roomService.createRoomReservation(
      roomId,
      dates.start,
      dates.end,
    );

    const reserveDto = new ReserveRoomDto();
    reserveDto.requestMemberId = member.id;
    reserveDto.roomId = roomId;
    reserveDto.startDate = dates.start;
    reserveDto.endDate = dates.end;
    reserveDto.paymentMethod = dto.paymentMethod;
    reserveDto.requestMemberNickname = member.nickname;
    return this.roomService.reserveRoom(reserveDto);
  }

  @Get('orders')
  @Authorization()
  getOrders(
    @JwtMember() member: JwtMemberDto,
    @PageRequest() pageable: Pageable,
  ) {
    return this.roomService.getOrders(member, pageable);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
  //   return this.roomService.update(+id, updateRoomDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.roomService.remove(+id);
  // }
  private validateReservationDate(startDate: string, endDate: string) {
    const start = moment(startDate, DateFormat.DATE);
    const end = moment(endDate, DateFormat.DATE);
    const now = moment().startOf('day');
    if (
      start.isBefore(now) ||
      end.isBefore(now) ||
      start.isAfter(end) ||
      start.isSame(end)
    ) {
      throw new InvalidReservationDateException();
    }
    return {
      start: start.toDate(),
      end: end.toDate(),
    };
  }
}
