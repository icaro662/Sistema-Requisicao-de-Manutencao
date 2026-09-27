import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Requisition } from '../models/requisition.entity';
import { RequisitionStatus } from '../core/enums/status.enum';
import { UserRole } from '../models/user.entity';
import { DashboardFilterDto } from '../dtos/dashboard/dashboard-filter.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
  ) {}

  async summary(userRole: string, userId: string, filters: DashboardFilterDto = {}): Promise<{ total: number; byStatus: Record<string, number> }> {
    if (filters.from && filters.to && new Date(filters.from) > new Date(filters.to)) {
      throw new BadRequestException('A data inicial não pode ser posterior à data final');
    }

    const qb = this.requisitionsRepository.createQueryBuilder('r');

    // Role-based filtering
    if (userRole === UserRole.REQUESTER) {
      qb.where('r.requesterId = :userId', { userId });
    } else if (userRole === UserRole.EXECUTOR) {
      qb.where('(r.executorId = :userId OR r.executorId IS NULL)', { userId });
    }

    if (filters.from) qb.andWhere('r.createdAt >= :from', { from: filters.from });
    if (filters.to) qb.andWhere('r.createdAt <= :to', { to: filters.to });
    if (filters.locationId) qb.andWhere('r.locationId = :locationId', { locationId: filters.locationId });
    if (filters.executorId) qb.andWhere('r.executorId = :executorId', { executorId: filters.executorId });
    if (filters.categoryId) qb.andWhere('r.categoryId = :categoryId', { categoryId: filters.categoryId });
    if (filters.priority) qb.andWhere('r.priority = :priority', { priority: filters.priority });
    if (filters.status) qb.andWhere('r.status = :status', { status: filters.status });

    const requisitions = await qb.getMany();

    const byStatus: Record<string, number> = {};
    for (const status of Object.values(RequisitionStatus)) {
      byStatus[status] = requisitions.filter((r) => r.status === status).length;
    }

    return { total: requisitions.length, byStatus };
  }
}