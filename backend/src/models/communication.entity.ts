import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CommunicationChannel, CommunicationOutcome } from '../core/enums/communication.enum';

/**
 * Comunicação enviada pelo sistema (notificação no aplicativo ou e-mail).
 * É o histórico de comunicações mostrado na tela de Notificações: o quê foi
 * enviado, para quem, por qual canal e qual foi o resultado do envio.
 */
@Entity('comunicacoes')
@Index('IDX_comunicacoes_destinatario', ['recipientId'])
@Index('IDX_comunicacoes_criado', ['createdAt'])
export class Communication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Requisição relacionada (null apenas para comunicações avulsas). */
  @Column({ name: 'requisicao_id', type: 'varchar', length: 36, nullable: true })
  requisitionId: string | null;

  @Column({ name: 'requisicao_numero', type: 'varchar', length: 20, nullable: true })
  requisitionNumber: string | null;

  @Column({ name: 'destinatario_id', type: 'varchar', length: 36, nullable: true })
  recipientId: string | null;

  @Column({ name: 'destinatario_nome', type: 'varchar', length: 255 })
  recipientName: string;

  @Column({ name: 'destinatario_email', type: 'varchar', length: 255, nullable: true })
  recipientEmail: string | null;

  @Column({ name: 'canal', type: 'varchar', length: 20, default: CommunicationChannel.APPLICATION })
  channel: CommunicationChannel;

  @Column({ name: 'assunto', type: 'varchar', length: 200 })
  subject: string;

  /** Conteúdo enviado (texto da notificação ou HTML do e-mail). */
  @Column({ name: 'conteudo', type: 'text' })
  body: string;

  @Column({ name: 'resultado', type: 'varchar', length: 20, default: CommunicationOutcome.SENT })
  outcome: CommunicationOutcome;

  /** Detalhe do resultado (mensagem de erro quando o envio falha). */
  @Column({ name: 'resultado_detalhe', type: 'varchar', length: 500, nullable: true })
  detail: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  updatedAt: Date;
}
