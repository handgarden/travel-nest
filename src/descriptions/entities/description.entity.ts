import { Destination } from 'src/destinations/entities/destination.entity';
import { Member } from 'src/member/entities/member.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Description {
  id: number;

  @ManyToOne(() => Member)
  creator: Promise<Member>;

  @ManyToOne(() => Destination)
  @JoinColumn()
  destination: Promise<Destination>;

  @Column({ type: 'text' })
  content: string;
}
