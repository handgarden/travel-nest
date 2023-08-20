import { Member } from 'src/member/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TravelPay {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Member)
  @JoinColumn()
  member: Promise<Member>;

  @Column()
  balance: number;
}
