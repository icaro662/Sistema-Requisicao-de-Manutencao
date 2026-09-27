import { RequisitionPriority } from '../src/core/enums/priority.enum';
import { RequisitionStatus } from '../src/core/enums/status.enum';
import { DashboardService } from '../src/services/dashboard.service';
import { UserRole } from '../src/models/user.entity';

describe('DashboardService', () => {
  it('applies all dashboard filters and calculates indicators', async () => {
    const rows = [
      { status: RequisitionStatus.OPEN },
      { status: RequisitionStatus.IN_SERVICE },
      { status: RequisitionStatus.COMPLETED },
    ];
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(rows),
    };
    const repository = { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) };
    const service = new DashboardService(repository as never);

    const summary = await service.summary(UserRole.MANAGER, 'manager-id', {
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-01-31T23:59:59.999Z',
      locationId: 'location-id',
      executorId: 'executor-id',
      categoryId: 'category-id',
      priority: RequisitionPriority.HIGH,
      status: RequisitionStatus.OPEN,
    });

    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(1, 'r.createdAt >= :from', { from: '2026-01-01T00:00:00.000Z' });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(7, 'r.status = :status', { status: RequisitionStatus.OPEN });
    expect(summary.total).toBe(3);
    expect(summary.byStatus).toEqual({
      aberta: 1,
      em_analise: 0,
      em_atendimento: 1,
      aguardando_material: 0,
      concluida: 1,
      cancelada: 0,
    });
  });
});
