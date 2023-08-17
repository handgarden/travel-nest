import { DefaultEntity } from 'src/common/entity/default.entity';
import { Destination } from 'src/destinations/entities/destination.entity';
import { Member } from 'src/member/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Description extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'creator_id' })
  creator: Promise<Member>;

  @ManyToOne(() => Destination)
  @JoinColumn({ name: 'destination_id' })
  destination: Promise<Destination>;

  @Column({ type: 'text' })
  content: string;
}
