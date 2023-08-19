import { DefaultEntity } from 'src/common/entity/default.entity';
import { Member } from 'src/member/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Journey extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member)
  @JoinColumn()
  creator: Promise<Member>;

  @Column()
  title: string;

  @Column({ type: 'text', name: 'content' })
  review: string;
}
