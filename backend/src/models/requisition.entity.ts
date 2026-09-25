import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RequisitionPriority } from '../core/enums/priority.enum';
import { RequisitionStatus } from '../core/enums/status.enum';

@Entity('requisitions')
export class Requisition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: string;

  @Column({ name: 'requester_id' })
  requesterId: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: RequisitionStatus, default: RequisitionStatus.OPEN })
  status: RequisitionStatus;

  @Column({ type: 'enum', enum: RequisitionPriority, default: RequisitionPriority.MEDIUM })
  priority: RequisitionPriority;

  @Column({ name: 'requester_email' })
  requesterEmail: string;

  @Column({ name: 'requester_phone' })
  requesterPhone: string;

  @Column({ name: 'executor_id', nullable: true })
  executorId: string | null;

  @Column({ name: 'execution_description', type: 'text', nullable: true })
  executionDescription: string | null;

  @Column({ name: 'execution_date', nullable: true })
  executionDate: Date | null;

  @Column({ name: 'materials_used', type: 'text', nullable: true })
  materialsUsed: string | null;

  @Column({ type: 'text', nullable: true })
  observations: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
