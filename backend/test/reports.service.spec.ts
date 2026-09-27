import { RequisitionPriority } from '../src/core/enums/priority.enum';
import { RequisitionStatus } from '../src/core/enums/status.enum';
import { ReportsService } from '../src/services/reports.service';

describe('ReportsService', () => {
  it('applies report filters and summarizes results by status', async () => {
    const rows = [
      { status: RequisitionStatus.OPEN },
      { status: RequisitionStatus.COMPLETED },
      { status: RequisitionStatus.OPEN },
    ];
    const queryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(rows),
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

    expect(queryBuilder.andWhere).toHaveBeenCalledTimes(7);
    expect(report.total).toBe(3);
    expect(report.byStatus).toEqual({ aberta: 2, concluida: 1 });

    const pdf = await service.exportPdf({ status: RequisitionStatus.OPEN });
    const excel = await service.exportExcel({ status: RequisitionStatus.OPEN });

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(excel.subarray(0, 2).toString()).toBe('PK');
  });
});
