import { Member } from 'src/member/entities/member.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CreditCard {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member)
  member: Promise<Member>;

  @Column()
  name: string;

  @Column()
  owner: string;

  @Column()
  cardNumber: string;

  @Column()
  mockBalance: number;
}
