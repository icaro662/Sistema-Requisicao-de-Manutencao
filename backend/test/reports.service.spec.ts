import { RequisitionPriority } from '../src/core/enums/priority.enum';
import { RequisitionStatus } from '../src/core/enums/status.enum';
import { ReportsService } from '../src/services/reports.service';

describe('ReportsService', () => {
  it('applies report filters and summarizes results by status', async () => {
    const rows = [
      { status: RequisitionStatus.OPEN, createdAt: new Date('2026-01-05') },
      { status: RequisitionStatus.COMPLETED, createdAt: new Date('2026-01-15') },
      { status: RequisitionStatus.OPEN, createdAt: new Date('2026-02-01T12:00:00.000Z') },
    ];
    const queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(rows),
      take: jest.fn().mockReturnThis(),
    };
    const repository = { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) };
    const service = new ReportsService(repository as never);

    const report = await service.findReport({
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-01-31T23:59:59.999Z',
      locationId: 'location-id',
      executorId: 'executor-id',
      categoryId: 'category-id',
      priority: RequisitionPriority.HIGH,
      status: RequisitionStatus.OPEN,
    });

    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(1, 'requisition.createdAt >= :from', { from: '2026-01-01T00:00:00.000Z' });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(2, 'requisition.createdAt <= :to', { to: '2026-01-31T23:59:59.999Z' });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(7, 'requisition.status = :status', { status: RequisitionStatus.OPEN });
    expect(queryBuilder.take).toHaveBeenCalledWith(5000);
    expect(report.total).toBe(3);
    expect(report.byStatus).toEqual({ aberta: 2, concluida: 1 });
    expect(report.byPeriod).toEqual({ '2026-01': 2, '2026-02': 1 });

    const pdf = await service.exportPdf({ status: RequisitionStatus.OPEN });
    const excel = await service.exportExcel({ status: RequisitionStatus.OPEN });

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(excel.subarray(0, 2).toString()).toBe('PK');
  });

  it('rejects an inverted date range', async () => {
    const service = new ReportsService({ createQueryBuilder: jest.fn() } as never);

    await expect(service.findReport({
      from: '2026-02-01T00:00:00.000Z',
      to: '2026-01-01T00:00:00.000Z',
    })).rejects.toThrow('A data inicial não pode ser posterior à data final');
  });
});
