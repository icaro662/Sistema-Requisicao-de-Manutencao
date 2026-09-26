import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requisition } from '../models/requisition.entity';
import { RequisitionStatus } from '../core/enums/status.enum';

export interface Notification {
  id: string;
  message: string;
  requisitionId: string;
  requisitionNumber: string;
  status: RequisitionStatus;
  createdAt: Date;
  read: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
  ) {}

  async findForUser(userId: string, userRole: string): Promise<Notification[]> {
    const qb = this.requisitionsRepository.createQueryBuilder('r');

    if (userRole === 'solicitante') {
      qb.where('r.requesterId = :userId', { userId });
    } else if (userRole === 'executor') {
      qb.where('r.executorId = :userId', { userId });
    }

    const requisitions = await qb.orderBy('r.createdAt', 'DESC').getMany();

    return requisitions.map((r) => ({
      id: r.id,
      message: `Solicitação ${r.number || r.id.slice(0, 8)} atualizada`,
      requisitionId: r.id,
      requisitionNumber: r.number || '',
      status: r.status,
      createdAt: r.createdAt,
      read: false,
    }));
  }

  async findById(id: string): Promise<Notification | null> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id } });
    if (!requisition) return null;

    return {
      id: requisition.id,
      message: `Solicitação ${requisition.number || requisition.id.slice(0, 8)} atualizada`,
      requisitionId: requisition.id,
      requisitionNumber: requisition.number || '',
      status: requisition.status,
      createdAt: requisition.createdAt,
      read: false,
    };
  }

  notifyRequisitionCreated(requisitionId: string): void {
    this.logger.log(`Notification queued for requisition ${requisitionId}`);
  }
}
