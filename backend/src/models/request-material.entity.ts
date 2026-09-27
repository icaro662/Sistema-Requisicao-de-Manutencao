import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Requisition } from './requisition.entity';
import { ManyToOne, JoinColumn } from 'typeorm';

@Entity('materiais_solicitacao')
export class RequestMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'requisicao_id' })
  requisitionId: string;

  @ManyToOne(() => Requisition, (requisition) => requisition.requestMaterials)
  @JoinColumn({ name: 'requisicao_id' })
  requisition: Requisition;

  @Column({ name: 'material_necessario', type: 'text' })
  materialsNeeded: string;

  @Column({ name: 'motivo', type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  updatedAt: Date;
}
