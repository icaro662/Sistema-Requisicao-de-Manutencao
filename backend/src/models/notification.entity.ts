import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RequisitionStatus } from '../core/enums/status.enum';

/**
 * Notificação endereçada a um usuário — hoje, ao gestor da requisição.
 * Alimenta o sino do topo e a tela de Notificações; o estado de leitura é
 * guardado por navegador (mesmo mecanismo do sino).
 */
@Entity('notificacoes')
@Index('IDX_notificacoes_destinatario', ['recipientId'])
@Index('IDX_notificacoes_criado', ['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Requisição que originou a notificação. */
  @Column({ name: 'requisicao_id', type: 'varchar', length: 36, nullable: true })
  requisitionId: string | null;

  /** Nº da requisição no momento do envio (exibido sem consultar a tabela). */
  @Column({ name: 'requisicao_numero', type: 'varchar', length: 20, nullable: true })
  requisitionNumber: string | null;

  /** Usuário que recebe a notificação (gestor responsável ou equipe de gestão). */
  @Column({ name: 'destinatario_id', type: 'varchar', length: 36 })
  recipientId: string;

  /** Texto exibido no sino e na tela de notificações. */
  @Column({ name: 'mensagem', type: 'varchar', length: 500 })
  message: string;

  /** Status da requisição no momento da notificação. */
  @Column({ name: 'status', type: 'varchar', length: 30, nullable: true })
  status: RequisitionStatus | null;

  @CreateDateColumn({ name: 'criado_em' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  updatedAt: Date;
}
