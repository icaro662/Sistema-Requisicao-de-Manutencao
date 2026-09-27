import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilterReportDto } from '../dtos/reports/filter-report.dto';
import { ReportDto } from '../dtos/reports/report.dto';
import { Requisition } from '../models/requisition.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
  ) {}

  async findReport(filters: FilterReportDto): Promise<ReportDto> {
    const query = this.requisitionsRepository.createQueryBuilder('requisition');

    if (filters.from) query.andWhere('requisition.createdAt >= :from', { from: filters.from });
    if (filters.to) query.andWhere('requisition.createdAt <= :to', { to: filters.to });
    if (filters.locationId) query.andWhere('requisition.locationId = :locationId', { locationId: filters.locationId });
    if (filters.executorId) query.andWhere('requisition.executorId = :executorId', { executorId: filters.executorId });
    if (filters.categoryId) query.andWhere('requisition.categoryId = :categoryId', { categoryId: filters.categoryId });
    if (filters.priority) query.andWhere('requisition.priority = :priority', { priority: filters.priority });
    if (filters.status) query.andWhere('requisition.status = :status', { status: filters.status });

    const rows = await query.orderBy('requisition.createdAt', 'DESC').getMany();
    const byStatus = rows.reduce<Record<string, number>>((summary, requisition) => {
      summary[requisition.status] = (summary[requisition.status] ?? 0) + 1;
      return summary;
    }, {});

    return { generatedAt: new Date(), total: rows.length, rows, byStatus };
  }

  exportPdf(): { message: string } { return { message: 'PDF export placeholder' }; }
  exportExcel(): { message: string } { return { message: 'Excel export placeholder' }; }
}
