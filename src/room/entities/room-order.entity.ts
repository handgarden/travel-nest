import { Member } from 'src/member/entities/member.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './room.entity';
import { OrderStatus } from './order-status.enum';
import { OrderTypeEntity } from 'src/payment/entities/order-type.entity';

@Entity()
export class RoomOrder extends OrderTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member)
  consumer: Promise<Member>;

  @ManyToOne(() => Member)
  producer: Promise<Member>;

  @ManyToOne(() => Room)
  room: Promise<Room>;

  @Column()
  status: OrderStatus;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  totalPrice: number;
}
