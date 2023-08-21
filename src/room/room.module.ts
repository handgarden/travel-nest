import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destination } from 'src/destinations/entities/destination.entity';
import { Room } from './entities/room.entity';
import { RoomReservation } from './entities/room-reservation.entity';
import { PaymentModule } from 'src/payment/payment.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { RoomOrder } from './entities/room-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Destination, Room, RoomReservation, RoomOrder]),
    PaymentModule,
    TransactionModule,
  ],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
