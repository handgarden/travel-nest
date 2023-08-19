import { DefaultEntity } from 'src/common/entity/default.entity';
import { Destination } from 'src/destinations/entities/destination.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Room extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  stock: number;

  @Column()
  inTime: Date;

  @ManyToOne(() => Destination)
  destination: Promise<Destination>;
}
