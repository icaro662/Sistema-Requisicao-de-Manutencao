import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requisition } from '../models/requisition.entity';
import { Category } from '../models/category.entity';
import { Location } from '../models/location.entity';
import { RequisitionStatus } from '../core/enums/status.enum';
import { statusLabel } from '../core/enums/status-labels';
import { HistoryAction } from '../models/history.entity';
import { HistoryService } from './history.service';
import { CancelRequisitionDto } from '../dtos/requisitions/cancel-requisition.dto';
import { CreateRequisitionDto } from '../dtos/requisitions/create-requisition.dto';
import { FilterRequisitionDto } from '../dtos/requisitions/filter-requisition.dto';
import { FinalizeRequisitionDto } from '../dtos/requisitions/finalize-requisition.dto';
import { RegisterExecutionDto } from '../dtos/requisitions/register-execution.dto';
import { UpdateRequisitionDto } from '../dtos/requisitions/update-requisition.dto';
import { UpdateStatusDto } from '../dtos/requisitions/update-status.dto';
import { UserRole } from '../models/user.entity';

@Injectable()
export class RequisitionsService {
  constructor(
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly historyService: HistoryService,
  ) {}

  async findAll(query: FilterRequisitionDto, userRole: string, userId: string): Promise<{ data: Requisition[]; total: number }> {
    if (query.from && query.to && new Date(query.from) > new Date(query.to)) {
      throw new BadRequestException('A data inicial não pode ser posterior à data final');
    }

    const qb = this.requisitionsRepository.createQueryBuilder('r');

    if (userRole === UserRole.REQUESTER) {
      qb.andWhere('r.requesterId = :userId', { userId });
    } else if (userRole === UserRole.EXECUTOR) {
      qb.andWhere('(r.executorId = :userId OR r.executorId IS NULL)', { userId });
    }

    if (query.from) qb.andWhere('r.createdAt >= :from', { from: query.from });
    if (query.to) qb.andWhere('r.createdAt <= :to', { to: query.to });
    if (query.locationId) qb.andWhere('r.locationId = :locationId', { locationId: query.locationId });
    if (query.executorId) qb.andWhere('r.executorId = :executorId', { executorId: query.executorId });
    if (query.categoryId) qb.andWhere('r.categoryId = :categoryId', { categoryId: query.categoryId });
    if (query.priority) qb.andWhere('r.priority = :priority', { priority: query.priority });
    if (query.status) qb.andWhere('r.status = :status', { status: query.status });
    if (query.search) {
      qb.andWhere('(r.description LIKE :search OR r.number LIKE :search)', { search: `%${query.search}%` });
    }

    qb.orderBy('r.createdAt', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string, userRole: string, userId: string): Promise<Requisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    // Role-based access control
    if (userRole === UserRole.REQUESTER && requisition.requesterId !== userId) {
      throw new NotFoundException('Requisição não encontrada');
    }
    if (userRole === UserRole.EXECUTOR && requisition.executorId && requisition.executorId !== userId) {
      throw new NotFoundException('Requisição não encontrada');
    }

    return requisition;
  }

  async create(dto: CreateRequisitionDto, userId: string, userName: string): Promise<Requisition> {
    await this.ensureReferencesExist(dto.locationId, dto.categoryId);

    const count = await this.requisitionsRepository.count();
    const number = `REQ-${String(count + 1).padStart(5, '0')}`;

    const requisition = this.requisitionsRepository.create({
      number,
      requesterId: userId,
      locationId: dto.locationId,
      categoryId: dto.categoryId,
      description: dto.description,
      priority: dto.priority,
      requesterEmail: dto.requesterEmail,
      requesterPhone: dto.requesterPhone,
      requesterWhatsapp: dto.requesterWhatsapp || null,
      photoUrl: dto.photoUrl || null,
      status: RequisitionStatus.OPEN,
    });

    const saved = await this.requisitionsRepository.save(requisition);

    await this.historyService.record({
      requisitionId: saved.id,
      userId,
      userName,
      action: HistoryAction.CREATED,
      description: `Requisição ${saved.number} criada e aberta`,
      newStatus: RequisitionStatus.OPEN,
    });

    return saved;
  }

  async update(id: string, dto: UpdateRequisitionDto, userRole: string, userId: string): Promise<Requisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    if (userRole === UserRole.REQUESTER && requisition.requesterId !== userId) {
      throw new NotFoundException('Requisição não encontrada');
    }

    await this.ensureReferencesExist(dto.locationId, dto.categoryId);

    if (dto.locationId !== undefined) requisition.locationId = dto.locationId;
    if (dto.categoryId !== undefined) requisition.categoryId = dto.categoryId;
    if (dto.description !== undefined) requisition.description = dto.description;
    if (dto.priority !== undefined) requisition.priority = dto.priority;
    if (dto.requesterEmail !== undefined) requisition.requesterEmail = dto.requesterEmail;
    if (dto.requesterPhone !== undefined) requisition.requesterPhone = dto.requesterPhone;
    if (dto.requesterWhatsapp !== undefined) requisition.requesterWhatsapp = dto.requesterWhatsapp;
    if (dto.photoUrl !== undefined) requisition.photoUrl = dto.photoUrl;

    const changedFields = this.describeChangedFields(dto);
    const saved = await this.requisitionsRepository.save(requisition);

    if (changedFields.length) {
      await this.historyService.record({
        requisitionId: id,
        userId,
        action: HistoryAction.UPDATED,
        description: `Dados da requisição atualizados: ${changedFields.join(', ')}`,
      });
    }

    return saved;
  }

  private describeChangedFields(dto: UpdateRequisitionDto): string[] {
    const fields: Array<[keyof UpdateRequisitionDto, string]> = [
      ['locationId', 'local'],
      ['categoryId', 'categoria'],
      ['description', 'descrição'],
      ['priority', 'prioridade'],
      ['requesterEmail', 'e-mail do solicitante'],
      ['requesterPhone', 'telefone do solicitante'],
      ['requesterWhatsapp', 'whatsapp do solicitante'],
      ['photoUrl', 'foto'],
    ];

    return fields
      .filter(([key]) => dto[key] !== undefined)
      .map(([, label]) => label);
  }

  private async ensureReferencesExist(locationId: string | undefined, categoryId: string | undefined): Promise<void> {
    if (locationId !== undefined) {
      const location = await this.locationsRepository.findOne({ where: { id: locationId } });
      if (!location) throw new NotFoundException('Local não encontrado');
    }

    if (categoryId !== undefined) {
      const category = await this.categoriesRepository.findOne({ where: { id: categoryId } });
      if (!category) throw new NotFoundException('Categoria não encontrada');
    }
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userRole: string, userId: string): Promise<Requisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    if (userRole !== UserRole.EXECUTOR && userRole !== UserRole.MANAGER && userRole !== UserRole.ADMIN) {
      throw new NotFoundException('Requisição não encontrada');
    }

    // Only the assigned executor, manager, or admin can update status.
    if (userRole === UserRole.EXECUTOR && requisition.executorId !== userId) {
      throw new NotFoundException('Requisição não encontrada');
    }

    const previousStatus = requisition.status;
    requisition.status = dto.status;
    const saved = await this.requisitionsRepository.save(requisition);

    if (previousStatus !== dto.status) {
      await this.historyService.record({
        requisitionId: id,
        userId,
        action: HistoryAction.STATUS_CHANGED,
        description: `Status alterado de "${statusLabel(previousStatus)}" para "${statusLabel(dto.status)}"`,
        previousStatus,
        newStatus: dto.status,
      });
    }

    return saved;
  }

  async assignExecutor(id: string, executorId: string, userRole: string, actorId?: string): Promise<Requisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    const canAssignOthers = userRole === UserRole.MANAGER || userRole === UserRole.ADMIN;
    const isSelfAssignment = userRole === UserRole.EXECUTOR && executorId === actorId;

    // Managers/admins assign executors; executors may only take (assumir) a requisition for themselves.
    if (!canAssignOthers && !isSelfAssignment) {
      throw new NotFoundException('Requisição não encontrada');
    }

    if (isSelfAssignment && requisition.executorId && requisition.executorId !== executorId) {
      throw new BadRequestException('Requisição já está atribuída a outro executor');
    }

    if (requisition.status === RequisitionStatus.COMPLETED || requisition.status === RequisitionStatus.CANCELLED) {
      throw new BadRequestException('Requisição encerrada não pode receber um executor');
    }

    const previousStatus = requisition.status;
    requisition.executorId = executorId;
    requisition.status = RequisitionStatus.IN_SERVICE;
    const saved = await this.requisitionsRepository.save(requisition);

    const executorName = await this.historyService.describeUser(executorId);
    const action = actorId && actorId === executorId
      ? `Executor ${executorName} assumiu o atendimento`
      : `Executor ${executorName} atribuído à requisição`;

    await this.historyService.record({
      requisitionId: id,
      userId: actorId ?? executorId,
      action: HistoryAction.EXECUTOR_ASSIGNED,
      description: action,
      previousStatus,
      newStatus: saved.status,
    });

    return saved;
  }

  async registerExecution(id: string, dto: RegisterExecutionDto, userId: string): Promise<Requisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    // Only the assigned executor can register execution
    if (requisition.executorId !== userId) {
      throw new NotFoundException('Requisição não encontrada');
    }

    const previousStatus = requisition.status;
    requisition.executionDescription = dto.executionDescription;
    requisition.materialsUsed = dto.materialsUsed || null;
    requisition.observations = dto.observations || null;
    requisition.executionDate = new Date();
    requisition.status = RequisitionStatus.COMPLETED;

    const saved = await this.requisitionsRepository.save(requisition);

    await this.historyService.record({
      requisitionId: id,
      userId,
      action: HistoryAction.EXECUTION_REGISTERED,
      description: `Registro de execução salvo: ${dto.executionDescription}`,
      previousStatus,
      newStatus: saved.status,
    });

    return saved;
  }

  /** Finaliza (encerra) a requisição como concluída. */
  async finalize(id: string, dto: FinalizeRequisitionDto, userRole: string, userId: string): Promise<Requisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    this.ensureCanClose(requisition, userRole, userId);

    if (requisition.status === RequisitionStatus.CANCELLED) {
      throw new BadRequestException('Requisição cancelada não pode ser finalizada');
    }
    if (requisition.status === RequisitionStatus.COMPLETED) {
      throw new BadRequestException('Requisição já foi finalizada');
    }

    const previousStatus = requisition.status;
    requisition.status = RequisitionStatus.COMPLETED;
    requisition.executionDate = new Date();
    if (dto.executionDescription !== undefined) requisition.executionDescription = dto.executionDescription;
    if (dto.materialsUsed !== undefined) requisition.materialsUsed = dto.materialsUsed;
    if (dto.observations !== undefined) requisition.observations = dto.observations;

    const saved = await this.requisitionsRepository.save(requisition);

    await this.historyService.record({
      requisitionId: id,
      userId,
      action: HistoryAction.FINALIZED,
      description: dto.observations?.trim()
        ? `Requisição finalizada: ${dto.observations.trim()}`
        : 'Requisição finalizada (encerrada como concluída)',
      previousStatus,
      newStatus: saved.status,
    });

    return saved;
  }

  /** Encerra a requisição sem conclusão (cancelada). */
  async cancel(id: string, dto: CancelRequisitionDto, userRole: string, userId: string): Promise<Requisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    this.ensureCanClose(requisition, userRole, userId);

    if (requisition.status === RequisitionStatus.CANCELLED) {
      throw new BadRequestException('Requisição já foi encerrada');
    }

    const previousStatus = requisition.status;
    requisition.status = RequisitionStatus.CANCELLED;

    const saved = await this.requisitionsRepository.save(requisition);

    await this.historyService.record({
      requisitionId: id,
      userId,
      action: HistoryAction.CANCELLED,
      description: dto.motivo?.trim()
        ? `Requisição encerrada sem conclusão: ${dto.motivo.trim()}`
        : 'Requisição encerrada sem conclusão',
      previousStatus,
      newStatus: saved.status,
    });

    return saved;
  }

  private ensureCanClose(requisition: Requisition, userRole: string, userId: string): void {
    const isStaff = userRole === UserRole.MANAGER || userRole === UserRole.ADMIN;
    const isAssignedExecutor = userRole === UserRole.EXECUTOR && requisition.executorId === userId;

    if (!isStaff && !isAssignedExecutor) {
      throw new NotFoundException('Requisição não encontrada');
    }
  }
}
