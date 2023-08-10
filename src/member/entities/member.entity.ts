import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../enum/member.enum';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ unique: true })
  account: string;

  @Column()
  password: string;

  @Column({ unique: true })
  nickname: string;
}
