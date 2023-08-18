import { Description } from 'src/descriptions/entities/description.entity';
import { Journey } from './journey.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class JourneyContent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Journey)
  @JoinColumn()
  journey: Promise<Journey>;

  @ManyToOne(() => Description)
  @JoinColumn()
  description: Promise<Description>;
}
