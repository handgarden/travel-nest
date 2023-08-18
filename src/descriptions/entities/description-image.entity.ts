import { Destination } from 'src/destinations/entities/destination.entity';
import { UploadFile } from 'src/file/entities/upload-file.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Description } from './description.entity';

@Entity()
export class DescriptionImage {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UploadFile)
  @JoinColumn()
  uploadFile: Promise<UploadFile>;

  @ManyToOne(() => Destination)
  @JoinColumn()
  destination: Promise<Destination>;

  @ManyToOne(() => Description)
  @JoinColumn()
  description: Promise<Description>;
}
