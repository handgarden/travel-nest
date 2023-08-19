import { Description } from 'src/descriptions/entities/description.entity';
import { Journey } from './journey.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class JourneyContent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Journey)
  @JoinColumn({ name: 'journeyId' })
  journey: Promise<Journey>;

  @Column({ nullable: false })
  journeyId: number;

  @ManyToOne(() => Description)
  @JoinColumn()
  description: Promise<Description>;
}
