import { DefaultEntity } from 'src/common/entity/default.entity';
import { Room } from './room.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique('reserve_unique', ['roomId', 'reserveDate'])
export class RoomReservation extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'roomId' })
  room: Promise<Room>;

  @Column({ nullable: false })
  roomId: number;

  @Column()
  reserveDate: Date;

  @Column()
  stock: number;

  isOutOfStock() {
    return this.stock < 1;
  }
}
