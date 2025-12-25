import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('history')
@Index(['entity_type', 'entity_id'])
@Index(['user_id'])
@Index(['action'])
@Index(['created_at'])
@Index(['entity_type', 'entity_id', 'created_at'])
export class History {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'entity_type' })
  @Index()
  entityType: string;

  @Column({ type: 'integer', name: 'entity_id' })
  entityId: number;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  changes: Record<string, { old?: any; new?: any }> | null;

  @Column({ type: 'integer', name: 'user_id' })
  @Index()
  userId: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'user_name' })
  userName: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string | null;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

