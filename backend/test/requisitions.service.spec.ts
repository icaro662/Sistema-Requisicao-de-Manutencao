import { RequisitionsService } from '../src/services/requisitions.service';
import { UserRole } from '../src/models/user.entity';
import { RequisitionStatus } from '../src/core/enums/status.enum';
import { RequisitionPriority } from '../src/core/enums/priority.enum';

describe('RequisitionsService', () => {
  const queryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };
  const requisitionsRepository = {
    count: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const locationsRepository = { findOne: jest.fn() };
  const categoriesRepository = { findOne: jest.fn() };
  let service: RequisitionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    queryBuilder.andWhere.mockReturnThis();
    queryBuilder.orderBy.mockReturnThis();
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    requisitionsRepository.createQueryBuilder.mockReturnValue(queryBuilder);
    service = new RequisitionsService(
      requisitionsRepository as never,
      locationsRepository as never,
      categoriesRepository as never,
    );
  });

  it('applies multiple list filters including period, executor and category', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[{ id: 'req-1' }], 1]);

    const result = await service.findAll({
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-01-31T23:59:59.999Z',
      locationId: 'location-id',
      executorId: 'executor-id',
      categoryId: 'category-id',
      priority: RequisitionPriority.HIGH,
      status: RequisitionStatus.OPEN,
      search: 'REQ-00001',
    }, UserRole.MANAGER, 'manager-id');

    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(1, 'r.createdAt >= :from', { from: '2026-01-01T00:00:00.000Z' });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(2, 'r.createdAt <= :to', { to: '2026-01-31T23:59:59.999Z' });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(3, 'r.locationId = :locationId', { locationId: 'location-id' });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(4, 'r.executorId = :executorId', { executorId: 'executor-id' });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(5, 'r.categoryId = :categoryId', { categoryId: 'category-id' });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(6, 'r.priority = :priority', { priority: RequisitionPriority.HIGH });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(7, 'r.status = :status', { status: RequisitionStatus.OPEN });
    expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(8, '(r.description LIKE :search OR r.number LIKE :search)', { search: '%REQ-00001%' });
    expect(result).toEqual({ data: [{ id: 'req-1' }], total: 1 });
  });

  it('rejects inverted date range when listing requisitions', async () => {
    await expect(service.findAll({
      from: '2026-02-01T00:00:00.000Z',
      to: '2026-01-01T00:00:00.000Z',
    }, UserRole.MANAGER, 'manager-id')).rejects.toThrow('A data inicial não pode ser posterior à data final');

    expect(requisitionsRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('rejects creation when the location does not exist', async () => {
    locationsRepository.findOne.mockResolvedValue(null);

    await expect(service.create({
      locationId: 'location-id',
      categoryId: 'category-id',
      description: 'Torneira com vazamento',
      priority: RequisitionPriority.MEDIUM,
      requesterEmail: 'user@example.com',
      requesterPhone: '',
    }, 'requester-id', 'User')).rejects.toThrow('Local não encontrado');

    expect(requisitionsRepository.save).not.toHaveBeenCalled();
  });

  it('rejects requester updates for another requester\'s requisition', async () => {
    requisitionsRepository.findOne.mockResolvedValue({ requesterId: 'owner-id' });

    await expect(service.update('requisition-id', {}, UserRole.REQUESTER, 'other-id'))
      .rejects.toThrow('Requisição não encontrada');

    expect(requisitionsRepository.save).not.toHaveBeenCalled();
  });

  it('allows the assigned executor to update status', async () => {
    const requisition = { executorId: 'executor-id', status: RequisitionStatus.OPEN };
    requisitionsRepository.findOne.mockResolvedValue(requisition);
    requisitionsRepository.save.mockResolvedValue(requisition);

    await service.updateStatus('requisition-id', { status: RequisitionStatus.IN_SERVICE }, UserRole.EXECUTOR, 'executor-id');

    expect(requisition.status).toBe(RequisitionStatus.IN_SERVICE);
    expect(requisitionsRepository.save).toHaveBeenCalledWith(requisition);
  });
});
