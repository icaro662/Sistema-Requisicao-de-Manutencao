import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Requisition } from './requisition.entity';

/**
 * Tipo do evento registrado no log de auditoria (o "O quê" da operação).
 */
export enum HistoryAction {
  // Requisições
  CREATED = 'criacao',
  UPDATED = 'edicao',
  STATUS_CHANGED = 'alteracao_status',
  EXECUTOR_ASSIGNED = 'atribuicao_executor',
  EXECUTION_REGISTERED = 'registro_execucao',
  OBSERVATION_ADDED = 'observacao_adicionada',
  MATERIAL_REQUESTED = 'solicitacao_material',
  FINALIZED = 'finalizacao',
  CANCELLED = 'cancelamento',
  // Usuários
  USER_CREATED = 'criacao_usuario',
  USER_UPDATED = 'atualizacao_usuario',
  PASSWORD_RESET = 'redefinicao_senha',
  // Cadastros de referência
  LOCATION_CREATED = 'criacao_local',
  LOCATION_UPDATED = 'atualizacao_local',
  LOCATION_REMOVED = 'exclusao_local',
  CATEGORY_CREATED = 'criacao_categoria',
  CATEGORY_UPDATED = 'atualizacao_categoria',
  CATEGORY_REMOVED = 'exclusao_categoria',
  // Operação que retornou erro
  OPERATION_FAILED = 'falha_operacao',
}

/**
 * Objeto do sistema afetado pela operação auditada.
 */
export enum AuditEntity {
  REQUISITION = 'requisicao',
  USER = 'usuario',
  LOCATION = 'local',
  CATEGORY = 'categoria',
  SYSTEM = 'sistema',
}

/**
 * Resultado da operação (o "Resultado" do log de auditoria).
 */
export enum AuditResult {
  SUCCESS = 'sucesso',
  FAILURE = 'falha',
}

/**
 * Log de auditoria de uma operação: Quem, O quê, Quando e Resultado.
 * Quando o evento pertence a uma requisição, `requisitionId` é preenchido e a
 * linha também alimenta a linha do tempo daquela requisição.
 */
@Entity('historico_alteracoes')
// O índice de `requisicao_id` já existe (FK/criação da tabela em 1710000000001).
@Index('IDX_historico_alteracoes_usuario', ['userId'])
@Index('IDX_historico_alteracoes_criado', ['createdAt'])
export class RequisitionHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'requisicao_id', type: 'varchar', length: 36, nullable: true })
  requisitionId: string | null;

  @ManyToOne(() => Requisition, (requisition) => requisition.history, { nullable: true })
  @JoinColumn({ name: 'requisicao_id' })
  requisition: Requisition | null;

  /** Objeto auditado (requisição, usuário, local, categoria ou sistema). */
  @Column({ name: 'entidade', type: 'varchar', length: 30, default: AuditEntity.REQUISITION })
  entityType: AuditEntity;

  /** Identificador do objeto auditado (útil para fora do contexto de requisição). */
  @Column({ name: 'entidade_id', type: 'varchar', length: 36, nullable: true })
  entityId: string | null;

  @Column({ name: 'usuario_id', type: 'varchar', length: 36, nullable: true })
  userId: string | null;

  /** Quem realizou a operação. */
  @Column({ name: 'usuario_nome', type: 'varchar', length: 255 })
  userName: string;

  @Column({ name: 'acao', type: 'varchar', length: 50 })
  action: HistoryAction;

  /** Descrição legível da operação (o "O quê"). */
  @Column({ name: 'descricao', type: 'text' })
  description: string;

  @Column({ name: 'status_anterior', type: 'varchar', length: 30, nullable: true })
  previousStatus: string | null;

  @Column({ name: 'status_novo', type: 'varchar', length: 30, nullable: true })
  newStatus: string | null;

  /** Registro relacionado (ex.: id do registro de execução que originou o evento). */
  @Column({ name: 'referencia_id', type: 'varchar', length: 36, nullable: true })
  referenceId: string | null;

  /** Resultado da operação: sucesso ou falha. */
  @Column({ name: 'resultado', type: 'varchar', length: 20, default: AuditResult.SUCCESS })
  resultado: AuditResult;

  /** Detalhe do resultado (mensagem de erro quando o resultado é falha). */
  @Column({ name: 'resultado_detalhe', type: 'varchar', length: 500, nullable: true })
  resultadoDetalhe: string | null;

  /** Quando a operação aconteceu. */
  @CreateDateColumn({ name: 'criado_em' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  updatedAt: Date;
}
