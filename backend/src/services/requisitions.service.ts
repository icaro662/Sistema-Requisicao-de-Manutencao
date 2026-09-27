import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requisition } from '../models/requisition.entity';
import { RequisitionPriority } from '../core/enums/priority.enum';
import { RequisitionStatus } from '../core/enums/status.enum';
import { CreateRequisitionDto } from '../dtos/requisitions/create-requisition.dto';
import { RegisterExecutionDto } from '../dtos/requisitions/register-execution.dto';
import { UpdateRequisitionDto } from '../dtos/requisitions/update-requisition.dto';
import { UpdateStatusDto } from '../dtos/requisitions/update-status.dto';
import { UserRole } from '../models/user.entity';

export interface RequisitionQuery {
  status?: RequisitionStatus;
  priority?: RequisitionPriority;
  search?: string;
  requesterId?: string;
  executorId?: string;
  locationId?: string;
}

@Injectable()
export class RequisitionsService {
  constructor(
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
  ) {}

  async findAll(query: RequisitionQuery, userRole: string, userId: string): Promise<{ data: Requisition[]; total: number }> {
    const qb = this.requisitionsRepository.createQueryBuilder('r');

    // Role-based filtering
    if (userRole === UserRole.REQUESTER) {
      qb.andWhere('r.requesterId = :userId', { userId });
    } else if (userRole === UserRole.EXECUTOR) {
      qb.andWhere('(r.executorId = :userId OR r.executorId IS NULL)', { userId });
    }
    // MANAGER and ADMIN see all

    if (query.status) {
      qb.andWhere('r.status = :status', { status: query.status });
    }
    if (query.priority) {
      qb.andWhere('r.priority = :priority', { priority: query.priority });
    }
    if (query.locationId) {
      qb.andWhere('r.locationId = :locationId', { locationId: query.locationId });
    }
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
    if (userRole === UserRole.EXECUTOR && requisition.executorId !== userId) {
      throw new NotFoundException('Requisição não encontrada');
    }

    return requisition;
  }

  async create(dto: CreateRequisitionDto, userId: string, userName: string): Promise<Requisition> {
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

    return this.requisitionsRepository.save(requisition);
  }

  async update(id: string, dto: UpdateRequisitionDto, userRole: string, userId: string): Promise<Requisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    if (userRole === UserRole.REQUESTER && requisition.requesterId !== userId) {
      throw new NotFoundException('Requisição não encontrada');
    }

    if (dto.locationId !== undefined) requisition.locationId = dto.locationId;
    if (dto.categoryId !== undefined) requisition.categoryId = dto.categoryId;
    if (dto.description !== undefined) requisition.description = dto.description;
    if (dto.priority !== undefined) requisition.priority = dto.priority;
    if (dto.requesterEmail !== undefined) requisition.requesterEmail = dto.requesterEmail;
    if (dto.requesterPhone !== undefined) requisition.requesterPhone = dto.requesterPhone;
    if (dto.requesterWhatsapp !== undefined) requisition.requesterWhatsapp = dto.requesterWhatsapp;
    if (dto.photoUrl !== undefined) requisition.photoUrl = dto.photoUrl;

    return this.requisitionsRepository.save(requisition);
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userRole: string, userId: string): Promise<Requisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    // Only executor assigned, manager, or admin can update status
    if (userRole === UserRole.EXECUTOR && requisition.executorId !== userId) {
      throw new NotFoundException('Requisição não encontrada');
    }

    requisition.status = dto.status;
    return this.requisitionsRepository.save(requisition);
  }

  async assignExecutor(id: string, executorId: string, userRole: string): Promise<Requisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    // Only manager or admin can assign executors
    if (userRole !== UserRole.MANAGER && userRole !== UserRole.ADMIN) {
      throw new NotFoundException('Requisição não encontrada');
    }

    requisition.executorId = executorId;
    requisition.status = RequisitionStatus.IN_SERVICE;
    return this.requisitionsRepository.save(requisition);
  }

  async registerExecution(id: string, dto: RegisterExecutionDto, userId: string): Promise<Requisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    // Only the assigned executor can register execution
    if (requisition.executorId !== userId) {
      throw new NotFoundException('Requisição não encontrada');
    }

    requisition.executionDescription = dto.executionDescription;
    requisition.materialsUsed = dto.materialsUsed || null;
    requisition.observations = dto.observations || null;
    requisition.executionDate = new Date();
    requisition.status = RequisitionStatus.COMPLETED;

    return this.requisitionsRepository.save(requisition);
  }
}
