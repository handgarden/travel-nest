import { Description } from 'src/descriptions/entities/description.entity';
import { Journey } from './journey.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class JourneyContent {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => Journey)
  @JoinColumn()
  journey: Promise<Journey>;

  @ManyToOne(() => Description)
  @JoinColumn()
  description: Promise<Description>;
}
