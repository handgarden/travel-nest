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
  @JoinColumn({ name: 'member_id' })
  member: Promise<Member>;

  @Column({ nullable: false })
  member_id: number;

  @Column()
  balance: number;
}
