import { BadRequestException } from '@nestjs/common';
import { AuditoriaService } from '../src/services/auditoria.service';
import { AuditEntity, AuditResult, HistoryAction } from '../src/models/history.entity';

describe('AuditoriaService', () => {
  let qb: {
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    addOrderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };
  const historyRepository = { createQueryBuilder: jest.fn() };
  let service: AuditoriaService;

  beforeEach(() => {
    jest.clearAllMocks();
    qb = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    historyRepository.createQueryBuilder.mockReturnValue(qb);
    service = new AuditoriaService(historyRepository as never);
  });

  it('filters the log by user, action and result', async () => {
    await service.findAll({
      usuario: 'Maria',
      acao: HistoryAction.STATUS_CHANGED,
      resultado: AuditResult.FAILURE,
    });

    expect(qb.andWhere).toHaveBeenCalledWith(
      '(h.userName LIKE :usuario OR h.userId = :usuarioId)',
      { usuario: '%Maria%', usuarioId: 'Maria' },
    );
    expect(qb.andWhere).toHaveBeenCalledWith('h.action = :acao', { acao: HistoryAction.STATUS_CHANGED });
    expect(qb.andWhere).toHaveBeenCalledWith('h.resultado = :resultado', { resultado: AuditResult.FAILURE });
  });

  it('limits the date filter to the whole day', async () => {
    await service.findAll({ de: '2026-09-01', ate: '2026-09-30' });

    expect(qb.andWhere).toHaveBeenCalledWith('h.createdAt >= :de', { de: new Date('2026-09-01T00:00:00') });
    expect(qb.andWhere).toHaveBeenCalledWith('h.createdAt <= :ate', { ate: new Date('2026-09-30T23:59:59.999') });
  });

  it('rejects an inverted date range', async () => {
    await expect(service.findAll({ de: '2026-10-01', ate: '2026-09-01' })).rejects.toBeInstanceOf(BadRequestException);
    expect(historyRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('accepts a range where the start and end dates are the same day', async () => {
    await expect(service.findAll({ de: '2026-09-01', ate: '2026-09-01' })).resolves.toBeDefined();
  });

  it('filters by audited entity and requisition', async () => {
    await service.findAll({ entidade: AuditEntity.USER, requisicaoId: 'requisition-1' });

    expect(qb.andWhere).toHaveBeenCalledWith('h.entityType = :entidade', { entidade: AuditEntity.USER });
    expect(qb.andWhere).toHaveBeenCalledWith('h.requisitionId = :requisicaoId', { requisicaoId: 'requisition-1' });
  });

  it('returns newest entries first with pagination', async () => {
    qb.getManyAndCount.mockResolvedValue([[{ id: 'history-1' }], 41]);

    const page = await service.findAll({ page: 2, limit: 20 });

    expect(qb.orderBy).toHaveBeenCalledWith('h.createdAt', 'DESC');
    expect(qb.skip).toHaveBeenCalledWith(20);
    expect(qb.take).toHaveBeenCalledWith(20);
    expect(page).toEqual({ data: [{ id: 'history-1' }], total: 41, page: 2, limit: 20 });
  });

  it('uses safe defaults for pagination and caps the page size', async () => {
    const page = await service.findAll({ limit: 1000 });

    expect(qb.skip).toHaveBeenCalledWith(0);
    expect(qb.take).toHaveBeenCalledWith(100);
    expect(page.page).toBe(1);
    expect(page.limit).toBe(100);
  });
});
