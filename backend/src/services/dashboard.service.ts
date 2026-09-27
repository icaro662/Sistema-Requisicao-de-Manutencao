import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requisition } from '../models/requisition.entity';
import { RequisitionStatus } from '../core/enums/status.enum';
import { UserRole } from '../models/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
  ) {}

  async summary(userRole: string, userId: string): Promise<{ total: number; byStatus: Record<string, number> }> {
    const qb = this.requisitionsRepository.createQueryBuilder('r');

    // Role-based filtering
    if (userRole === UserRole.REQUESTER) {
      qb.where('r.requesterId = :userId', { userId });
    } else if (userRole === UserRole.EXECUTOR) {
      qb.where('(r.executorId = :userId OR r.executorId IS NULL)', { userId });
    }

    const requisitions = await qb.getMany();

    const byStatus: Record<string, number> = {};
    for (const status of Object.values(RequisitionStatus)) {
      byStatus[status] = requisitions.filter((r) => r.status === status).length;
    }

    return { total: requisitions.length, byStatus };
  }
}
