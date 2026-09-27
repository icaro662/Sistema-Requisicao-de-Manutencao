import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Requisition } from './requisition.entity';

@Entity('registros_execucao')
export class ExecutionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'requisicao_id' })
  requisitionId: string;

  @ManyToOne(() => Requisition, (requisition) => requisition.executionRecords)
  @JoinColumn({ name: 'requisicao_id' })
  requisition: Requisition;

  @Column({ name: 'executor_id' })
  executorId: string;

  @Column({ name: 'executor_nome' })
  executorName: string;

  @Column({ name: 'descricao_execucao', type: 'text' })
  executionDescription: string;

  @Column({ name: 'data_atendimento', type: 'datetime' })
  serviceDate: Date;

  @Column({ name: 'materiais_utilizados', type: 'text', nullable: true })
  materialsUsed: string | null;

  @Column({ name: 'observacoes', type: 'text', nullable: true })
  observations: string | null;

  @Column({ name: 'foto_url', type: 'varchar', length: 255, nullable: true })
  photoUrl: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  updatedAt: Date;
}
