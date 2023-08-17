import { Member } from 'src/member/entities/member.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class UploadFile {
  @PrimaryColumn()
  storeFileName: string;

  @Column()
  uploadFileName: string;

  @ManyToOne(() => Member)
  @JoinColumn()
  creator: Promise<Member>;
}
