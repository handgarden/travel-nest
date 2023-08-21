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
  @JoinColumn({ name: 'journey_id' })
  journey: Promise<Journey>;

  @Column({ nullable: false })
  journey_id: number;

  @ManyToOne(() => Description)
  @JoinColumn()
  description: Promise<Description>;
}
