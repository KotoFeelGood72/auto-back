import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('parsing_errors')
@Index(['parser_name'])
@Index(['is_processed'])
@Index(['created_at'])
@Index(['error_type'])
export class ParsingError {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'parser_name' })
  parser_name: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'varchar', length: 50, name: 'error_type' })
  error_type: string;

  @Column({ type: 'varchar', length: 255, name: 'error_name', nullable: true })
  error_name: string | null;

  @Column({ type: 'text', name: 'error_message', nullable: true })
  error_message: string | null;

  @Column({ type: 'text', name: 'error_stack', nullable: true })
  error_stack: string | null;

  @Column({ type: 'jsonb', name: 'car_data', nullable: true })
  car_data: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, any> | null;

  @Column({ type: 'boolean', name: 'is_processed', default: false })
  is_processed: boolean;

  @Column({ type: 'timestamp', name: 'processed_at', nullable: true })
  processed_at: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
