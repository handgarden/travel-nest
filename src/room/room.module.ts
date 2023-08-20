import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destination } from 'src/destinations/entities/destination.entity';
import { Room } from './entities/room.entity';
import { RoomReservation } from './entities/roomReservation.entity';
import { PaymentModule } from 'src/payment/payment.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Destination, Room, RoomReservation]),
    PaymentModule,
    TransactionModule,
  ],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
