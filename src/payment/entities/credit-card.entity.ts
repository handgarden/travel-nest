import { Member } from 'src/member/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class CreditCard {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId' })
  member: Promise<Member>;

  @Column({ nullable: false })
  memberId: number;

  @Column()
  name: string;

  @Column()
  owner: string;

  @Column()
  cardNumber: string;

  @Column()
  mockBalance: number;
}
