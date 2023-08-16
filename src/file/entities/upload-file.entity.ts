import { UUID } from 'crypto';
import { Member } from 'src/member/entities/member.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class UploadFile {
  @PrimaryColumn()
  storeFileName: UUID;

  @Column()
  uploadFileName: string;

  @ManyToOne(() => Member)
  @JoinColumn()
  creator: Member;
}
