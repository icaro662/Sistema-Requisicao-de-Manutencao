import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExecutionRecord } from '../models/execution-record.entity';
import { Requisition } from '../models/requisition.entity';
import { RequisitionStatus } from '../core/enums/status.enum';
import { UserRole } from '../models/user.entity';

export interface RegisterExecutionDto {
  executionDescription: string;
  materialsUsed?: string;
  observations?: string;
  photoUrl?: string;
}

@Injectable()
export class ExecutionRecordsService {
  constructor(
    @InjectRepository(ExecutionRecord)
    private readonly executionRecordsRepository: Repository<ExecutionRecord>,
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
  ) {}

  async findRequisitionHistory(requisitionId: string): Promise<ExecutionRecord[]> {
    return this.executionRecordsRepository.find({
      where: { requisitionId },
      order: { createdAt: 'DESC' },
    });
  }

  async registerExecution(
    requisitionId: string,
    dto: RegisterExecutionDto,
    executorId: string,
    executorName: string,
  ): Promise<ExecutionRecord> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id: requisitionId } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    if (requisition.executorId !== executorId) {
      throw new NotFoundException('Requisição não encontrada');
    }

    const record = this.executionRecordsRepository.create({
      requisitionId,
      executorId,
      executorName,
      executionDescription: dto.executionDescription,
      serviceDate: new Date(),
      materialsUsed: dto.materialsUsed || null,
      observations: dto.observations || null,
      photoUrl: dto.photoUrl || null,
    });

    const saved = await this.executionRecordsRepository.save(record);

    // Update requisition status to completed
    requisition.status = RequisitionStatus.COMPLETED;
    requisition.executionDescription = dto.executionDescription;
    requisition.materialsUsed = dto.materialsUsed || null;
    requisition.observations = dto.observations || null;
    requisition.executionDate = new Date();
    await this.requisitionsRepository.save(requisition);

    return saved;
  }

  async addObservation(
    requisitionId: string,
    observation: string,
    executorId: string,
  ): Promise<Requisition> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id: requisitionId } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    if (requisition.executorId !== executorId) {
      throw new NotFoundException('Requisição não encontrada');
    }

    requisition.observations = observation;
    return this.requisitionsRepository.save(requisition);
  }

  async findAllByExecutor(executorId: string): Promise<ExecutionRecord[]> {
    return this.executionRecordsRepository.find({
      where: { executorId },
      order: { createdAt: 'DESC' },
      relations: { requisition: true },
    });
  }
}
