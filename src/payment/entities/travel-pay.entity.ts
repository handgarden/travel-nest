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
  @JoinColumn({ name: 'memberId' })
  member: Promise<Member>;

  @Column({ nullable: false })
  memberId: number;

  @Column()
  balance: number;
}
