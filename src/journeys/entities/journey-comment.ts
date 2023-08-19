import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Journey } from './journey.entity';
import { Member } from 'src/member/entities/member.entity';
import { DefaultEntity } from 'src/common/entity/default.entity';

@Entity()
export class JourneyComment extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Journey)
  journey: Journey;

  @ManyToOne(() => Member)
  creator: Promise<Member>;

  @Column({ type: 'text' })
  content: string;
}
