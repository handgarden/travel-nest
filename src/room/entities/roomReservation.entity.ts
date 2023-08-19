import { DefaultEntity } from 'src/common/entity/default.entity';
import { Room } from './room.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RoomReservation extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room)
  @JoinColumn()
  room: Promise<Room>;

  @Column()
  reserveDate: Date;

  @Column()
  count: number;

  isOutOfStock() {
    return this.count < 1;
  }
}
