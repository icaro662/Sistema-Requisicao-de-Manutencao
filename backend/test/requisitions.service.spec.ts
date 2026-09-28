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
  const historyService = { record: jest.fn(), describeUser: jest.fn() };
  let service: RequisitionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    queryBuilder.andWhere.mockReturnThis();
    queryBuilder.orderBy.mockReturnThis();
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    historyService.record.mockResolvedValue(null);
    historyService.describeUser.mockResolvedValue('Ana Executor');
    requisitionsRepository.createQueryBuilder.mockReturnValue(queryBuilder);
    service = new RequisitionsService(
      requisitionsRepository as never,
      locationsRepository as never,
      categoriesRepository as never,
      historyService as never,
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

  it('logs status changes with who, what and when in the history', async () => {
    const requisition = { executorId: 'executor-id', status: RequisitionStatus.OPEN };
    requisitionsRepository.findOne.mockResolvedValue(requisition);
    requisitionsRepository.save.mockResolvedValue(requisition);

    await service.updateStatus('requisition-id', { status: RequisitionStatus.IN_SERVICE }, UserRole.MANAGER, 'manager-id');

    expect(historyService.record).toHaveBeenCalledWith({
      requisitionId: 'requisition-id',
      userId: 'manager-id',
      action: 'alteracao_status',
      description: 'Status alterado de "Aberta" para "Em atendimento"',
      previousStatus: RequisitionStatus.OPEN,
      newStatus: RequisitionStatus.IN_SERVICE,
    });
  });

  it('does not log history when the status does not change', async () => {
    const requisition = { executorId: 'executor-id', status: RequisitionStatus.OPEN };
    requisitionsRepository.findOne.mockResolvedValue(requisition);
    requisitionsRepository.save.mockResolvedValue(requisition);

    await service.updateStatus('requisition-id', { status: RequisitionStatus.OPEN }, UserRole.EXECUTOR, 'executor-id');

    expect(historyService.record).not.toHaveBeenCalled();
  });

  it('lets the executor take an available requisition for themselves', async () => {
    const requisition = { executorId: null, status: RequisitionStatus.OPEN };
    requisitionsRepository.findOne.mockResolvedValue(requisition);
    requisitionsRepository.save.mockResolvedValue(requisition);

    await service.assignExecutor('requisition-id', 'executor-id', UserRole.EXECUTOR, 'executor-id');

    expect(requisition.executorId).toBe('executor-id');
    expect(requisition.status).toBe(RequisitionStatus.IN_SERVICE);
    expect(historyService.record).toHaveBeenCalledWith(expect.objectContaining({
      requisitionId: 'requisition-id',
      action: 'atribuicao_executor',
      description: 'Executor Ana Executor assumiu o atendimento',
    }));
  });

  it('rejects an executor taking a requisition assigned to someone else', async () => {
    requisitionsRepository.findOne.mockResolvedValue({ executorId: 'other-executor', status: RequisitionStatus.IN_SERVICE });

    await expect(service.assignExecutor('requisition-id', 'executor-id', UserRole.EXECUTOR, 'executor-id'))
      .rejects.toThrow('Requisição já está atribuída a outro executor');

    expect(requisitionsRepository.save).not.toHaveBeenCalled();
  });

  it('finalizes a requisition and records it in the history', async () => {
    const requisition = { executorId: 'executor-id', status: RequisitionStatus.IN_SERVICE, executionDate: null as Date | null };
    requisitionsRepository.findOne.mockResolvedValue(requisition);
    requisitionsRepository.save.mockResolvedValue(requisition);

    await service.finalize('requisition-id', { observations: 'Serviço conferido' }, UserRole.EXECUTOR, 'executor-id');

    expect(requisition.status).toBe(RequisitionStatus.COMPLETED);
    expect(requisition.executionDate).toBeInstanceOf(Date);
    expect(historyService.record).toHaveBeenCalledWith(expect.objectContaining({
      requisitionId: 'requisition-id',
      userId: 'executor-id',
      action: 'finalizacao',
      description: 'Requisição finalizada: Serviço conferido',
      previousStatus: RequisitionStatus.IN_SERVICE,
      newStatus: RequisitionStatus.COMPLETED,
    }));
  });

  it('rejects finalization by an executor that is not assigned', async () => {
    requisitionsRepository.findOne.mockResolvedValue({ executorId: 'other-executor', status: RequisitionStatus.IN_SERVICE });

    await expect(service.finalize('requisition-id', {}, UserRole.EXECUTOR, 'executor-id'))
      .rejects.toThrow('Requisição não encontrada');

    expect(requisitionsRepository.save).not.toHaveBeenCalled();
  });

  it('closes a requisition without conclusion keeping the reason in the history', async () => {
    const requisition = { executorId: 'executor-id', status: RequisitionStatus.IN_SERVICE };
    requisitionsRepository.findOne.mockResolvedValue(requisition);
    requisitionsRepository.save.mockResolvedValue(requisition);

    await service.cancel('requisition-id', { motivo: 'Fora de escopo' }, UserRole.MANAGER, 'manager-id');

    expect(requisition.status).toBe(RequisitionStatus.CANCELLED);
    expect(historyService.record).toHaveBeenCalledWith(expect.objectContaining({
      action: 'cancelamento',
      description: 'Requisição encerrada sem conclusão: Fora de escopo',
      previousStatus: RequisitionStatus.IN_SERVICE,
      newStatus: RequisitionStatus.CANCELLED,
    }));
  });
});
