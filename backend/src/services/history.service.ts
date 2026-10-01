import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEntity, AuditResult, HistoryAction, RequisitionHistory } from '../models/history.entity';
import { Requisition } from '../models/requisition.entity';
import { User, UserRole } from '../models/user.entity';

export interface RecordHistoryInput {
  /** Requisição relacionada; omitido quando o evento não pertence a uma requisição. */
  requisitionId?: string | null;
  /** Objeto auditado; por padrão deriva de `requisitionId`. */
  entityType?: AuditEntity;
  /** Id do objeto auditado; por padrão deriva de `requisitionId`. */
  entityId?: string | null;
  userId?: string | null;
  /** Nome de exibição do responsável; quando ausente, é resolvido a partir do usuário. */
  userName?: string | null;
  action: HistoryAction;
  description: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  referenceId?: string | null;
  /** Resultado da operação (padrão: sucesso). */
  resultado?: AuditResult;
  /** Detalhe do resultado (mensagem de erro quando `resultado` é falha). */
  resultadoDetalhe?: string | null;
}

export interface HistoryViewer {
  id: string;
  role: string;
}

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(RequisitionHistory)
    private readonly historyRepository: Repository<RequisitionHistory>,
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Registra um evento no log de auditoria (Quem, O quê, Quando, Resultado).
   * Quando o evento pertence a uma requisição ele também alimenta a linha do
   * tempo dela. Falhas de gravação não interrompem a operação principal que
   * originou o evento.
   */
  async record(input: RecordHistoryInput): Promise<RequisitionHistory | null> {
    try {
      const requisitionId = input.requisitionId ?? null;
      const entry = this.historyRepository.create({
        requisitionId,
        entityType: input.entityType ?? (requisitionId ? AuditEntity.REQUISITION : AuditEntity.SYSTEM),
        entityId: input.entityId ?? requisitionId,
        userId: input.userId ?? null,
        userName: await this.describeUser(input.userId, input.userName),
        action: input.action,
        description: input.description,
        previousStatus: input.previousStatus ?? null,
        newStatus: input.newStatus ?? null,
        referenceId: input.referenceId ?? null,
        resultado: input.resultado ?? AuditResult.SUCCESS,
        resultadoDetalhe: input.resultadoDetalhe ?? null,
      });

      return await this.historyRepository.save(entry);
    } catch {
      return null;
    }
  }

  /** Lista o histórico completo da requisição, mais recente primeiro. */
  async findByRequisition(requisitionId: string, viewer: HistoryViewer): Promise<RequisitionHistory[]> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id: requisitionId } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    this.ensureCanView(requisition, viewer);

    return this.historyRepository.find({
      where: { requisitionId },
      order: { createdAt: 'DESC' },
    });
  }

  private ensureCanView(requisition: Requisition, viewer: HistoryViewer): void {
    if (viewer.role === UserRole.ADMIN || viewer.role === UserRole.MANAGER) return;

    if (viewer.role === UserRole.REQUESTER) {
      if (requisition.requesterId === viewer.id) return;
      throw new NotFoundException('Requisição não encontrada');
    }

    // Executores enxergam requisições atribuídas a eles e as disponíveis na fila.
    if (requisition.executorId === viewer.id || !requisition.executorId) return;

    throw new NotFoundException('Requisição não encontrada');
  }

  /** Nome de exibição de um usuário, com fallback para o informado. */
  async describeUser(userId?: string | null, fallback?: string | null): Promise<string> {
    if (userId) {
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (user?.name) return user.name;
    }
    return fallback?.trim() || 'Sistema';
  }
}
