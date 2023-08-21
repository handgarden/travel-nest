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
  @JoinColumn({ name: 'member_id' })
  member: Promise<Member>;

  @Column({ nullable: false })
  member_id: number;

  @Column()
  name: string;

  @Column()
  owner: string;

  @Column()
  cardNumber: string;

  @Column()
  mockBalance: number;
}
