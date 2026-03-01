import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { Exclude } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../../../shared/enums/role.enum';

@Entity('users')
export class User {
  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  generateUserId() {
    if (!this.id) this.id = uuidv4();
  }

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Exclude()
  @Column({ type: 'text', nullable: true, select: false })
  refreshToken: string | null;

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
