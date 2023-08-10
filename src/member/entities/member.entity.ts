import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../enum/Role';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', enum: Role, default: Role.USER })
  role: Role;

  @Column({ unique: true })
  account: string;

  @Column()
  password: string;

  @Column({ unique: true })
  nickname: string;
}
