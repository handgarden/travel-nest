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
@Unique('reserve_unique', ['room_id', 'reserveDate'])
export class RoomReservation extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room)
  @JoinColumn({ name: 'room_id' })
  room: Promise<Room>;

  @Column({ nullable: false })
  room_id: number;

  @Column()
  reserveDate: Date;

  @Column()
  stock: number;

  isOutOfStock() {
    return this.stock < 1;
  }
}
