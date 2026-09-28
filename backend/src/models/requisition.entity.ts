import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ExecutionRecord } from './execution-record.entity';
import { RequisitionPriority } from '../core/enums/priority.enum';
import { RequisitionStatus } from '../core/enums/status.enum';
import { RequisitionHistory } from './history.entity';
import { RequestMaterial } from './request-material.entity';

@Entity('requisicoes')
export class Requisition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero', unique: true })
  number: string;

  @Column({ name: 'solicitante_id' })
  requesterId: string;

  @Column({ name: 'local_id' })
  locationId: string;

  @Column({ name: 'categoria_id' })
  categoryId: string;

  @Column({ name: 'descricao', type: 'text' })
  description: string;

  @Column({ name: 'status', type: 'enum', enum: RequisitionStatus, default: RequisitionStatus.OPEN })
  status: RequisitionStatus;

  @Column({ name: 'prioridade', type: 'enum', enum: RequisitionPriority, default: RequisitionPriority.MEDIUM })
  priority: RequisitionPriority;

  @Column({ name: 'email_solicitante' })
  requesterEmail: string;

  @Column({ name: 'telefone_solicitante' })
  requesterPhone: string;

  @Column({ name: 'whatsapp_solicitante', type: 'varchar', length: 30, nullable: true })
  requesterWhatsapp: string | null;

  @Column({ name: 'foto_url', type: 'varchar', length: 255, nullable: true })
  photoUrl: string | null;

  @Column({ name: 'executor_id', type: 'varchar', length: 36, nullable: true })
  executorId: string | null;

  /** Gestor responsável pela requisição: destinatário das notificações. */
  @Column({ name: 'gestor_id', type: 'varchar', length: 36, nullable: true })
  gestorId: string | null;

  @Column({ name: 'descricao_execucao', type: 'text', nullable: true })
  executionDescription: string | null;

  @Column({ name: 'data_execucao', type: 'datetime', nullable: true })
  executionDate: Date | null;

  @Column({ name: 'materiais_utilizados', type: 'text', nullable: true })
  materialsUsed: string | null;

  @Column({ name: 'observacoes', type: 'text', nullable: true })
  observations: string | null;

  @OneToMany(() => RequestMaterial, (material) => material.requisition)
  requestMaterials: RequestMaterial[];

  @OneToMany(() => ExecutionRecord, (record) => record.requisition)
  executionRecords: ExecutionRecord[];

  @OneToMany(() => RequisitionHistory, (history) => history.requisition)
  history: RequisitionHistory[];

  @CreateDateColumn({ name: 'criado_em' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  updatedAt: Date;
}
