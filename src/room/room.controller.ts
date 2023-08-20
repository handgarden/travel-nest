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
import { ParseDatePipe } from 'src/common/pipe/parse-date.pipe';
import { InvalidReservationDateException } from './exception/invalid-reservation-date.exception';
import { ReserveRoomRequest } from './dto/reserve-room-request.dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
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
    @Query('start', ParseDatePipe) startDate: Date,
    @Query('end', ParseDatePipe) endDate: Date,
  ) {
    this.validateReservationDate(startDate, endDate);
    return this.roomService.findAll(destinationId, startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findOne(id);
  }

  @Post(':id')
  reserve(@Body() dto: ReserveRoomRequest) {
    console.log(dto);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
  //   return this.roomService.update(+id, updateRoomDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.roomService.remove(+id);
  // }
  private validateReservationDate(startDate: Date, endDate: Date) {
    const now = new Date();
    const startDateStr = `${startDate.getMonth() + 1}-${startDate.getDate()}`;
    const nowDateStr = `${now.getMonth() + 1}-${now.getDate()}`;
    const endDateStr = `${endDate.getMonth() + 1}-${endDate.getDate()}`;
    if (
      startDateStr < nowDateStr ||
      endDateStr < nowDateStr ||
      startDate > endDate
    ) {
      throw new InvalidReservationDateException();
    }
  }
}
