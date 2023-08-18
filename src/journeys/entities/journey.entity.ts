import { Member } from 'src/member/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Journey {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member)
  @JoinColumn()
  creator: Member;

  @Column()
  title: string;

  @Column({ type: 'text', name: 'content' })
  review: string;
}
