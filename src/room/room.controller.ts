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
import { ParseDatePipe } from 'src/common/pipe/pase-date.pipe';
import { InvalidReservationDateException } from './exception/invalid-reservation-date.exception';

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

  @Get(':id')
  findAll(
    @Param('id', ParseIntPipe) destinationId,
    @Query('start', ParseDatePipe) startDate: Date,
    @Query('end', ParseDatePipe) endDate: Date,
  ) {
    this.validateReservationDate(startDate, endDate);
    return this.roomService.findAll(destinationId, startDate, endDate);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.roomService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
  //   return this.roomService.update(+id, updateRoomDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.roomService.remove(+id);
  // }
  private validateReservationDate(startDate: Date, endDate: Date) {
    if (startDate < new Date() || startDate > endDate) {
      throw new InvalidReservationDateException();
    }
  }
}
