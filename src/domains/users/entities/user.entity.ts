import { Role } from '@domains/roles/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SocialAuthType } from '@domains/auth/social-auth.enum';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: true })
  password?: string;

  @Column({ nullable: true, type: 'bigint' })
  emailVerifiedAt?: number;

  @Column({ nullable: true })
  socialId?: string;

  @Column({ type: 'enum', nullable: true, enum: SocialAuthType })
  socialType?: SocialAuthType;

  @ManyToOne(() => Role, (role) => role.users)
  role?: Role;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
