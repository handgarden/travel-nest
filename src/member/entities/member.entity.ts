import { DefaultEntity } from 'src/common/entity/default.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../enum/Role';

@Entity()
export class Member extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role: Role;

  @Column({ unique: true })
  account: string;

  @Column()
  password: string;

  @Column({ unique: true })
  nickname: string;
}
