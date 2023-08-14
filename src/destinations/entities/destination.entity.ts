import { DefaultEntity } from 'src/common/entity/default.entity';
import { Member } from 'src/member/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Category } from '../category.enum';

@Entity()
@Unique('desintaion_title_address_unique', ['title', 'address'])
export class Destination extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Member)
  @JoinColumn()
  creator: Member;

  @Column()
  title: string;

  @Column()
  address: string;

  @Column()
  category: Category;
}
