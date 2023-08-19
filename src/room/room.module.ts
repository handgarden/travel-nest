import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destination } from 'src/destinations/entities/destination.entity';
import { Room } from './entities/room.entity';
import { RoomReservation } from './entities/roomReservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Destination, Room, RoomReservation])],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
