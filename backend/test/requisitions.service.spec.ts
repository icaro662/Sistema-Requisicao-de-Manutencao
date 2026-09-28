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
  const usersRepository = { findOne: jest.fn() };
  const historyService = { record: jest.fn(), describeUser: jest.fn() };
  const notificationsService = { notifyManager: jest.fn() };
  let service: RequisitionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    queryBuilder.andWhere.mockReturnThis();
    queryBuilder.orderBy.mockReturnThis();
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
    historyService.record.mockResolvedValue(null);
    historyService.describeUser.mockResolvedValue('Ana Executor');
    notificationsService.notifyManager.mockResolvedValue([]);
    requisitionsRepository.createQueryBuilder.mockReturnValue(queryBuilder);
    service = new RequisitionsService(
      requisitionsRepository as never,
      locationsRepository as never,
      categoriesRepository as never,
      usersRepository as never,
      historyService as never,
      notificationsService as never,
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

  it('notifies the manager automatically when the status changes', async () => {
    const requisition = { executorId: 'executor-id', status: RequisitionStatus.OPEN, number: 'REQ-00001' };
    requisitionsRepository.findOne.mockResolvedValue(requisition);
    requisitionsRepository.save.mockResolvedValue(requisition);

    await service.updateStatus('requisition-id', { status: RequisitionStatus.IN_SERVICE }, UserRole.EXECUTOR, 'executor-id');

    expect(notificationsService.notifyManager).toHaveBeenCalledWith(requisition, {
      event: 'Status atualizado',
      previousStatus: RequisitionStatus.OPEN,
      actorId: 'executor-id',
    });
  });

  it('does not notify when the status stays the same', async () => {
    const requisition = { executorId: 'executor-id', status: RequisitionStatus.OPEN };
    requisitionsRepository.findOne.mockResolvedValue(requisition);
    requisitionsRepository.save.mockResolvedValue(requisition);

    await service.updateStatus('requisition-id', { status: RequisitionStatus.OPEN }, UserRole.EXECUTOR, 'executor-id');

    expect(notificationsService.notifyManager).not.toHaveBeenCalled();
  });

  it('stores the gestor of a new requisition and notifies them', async () => {
    locationsRepository.findOne.mockResolvedValue({ id: 'location-id' });
    categoriesRepository.findOne.mockResolvedValue({ id: 'category-id' });
    usersRepository.findOne.mockResolvedValue({ id: 'gestor-id', role: UserRole.MANAGER });
    requisitionsRepository.count.mockResolvedValue(0);
    requisitionsRepository.create.mockImplementation((value) => value);
    requisitionsRepository.save.mockImplementation((value) => Promise.resolve(value));

    const saved = await service.create({
      locationId: 'location-id',
      categoryId: 'category-id',
      description: 'Torneira com vazamento',
      priority: RequisitionPriority.MEDIUM,
      requesterEmail: 'user@example.com',
      requesterPhone: '',
      gestorId: 'gestor-id',
    }, 'requester-id', 'User');

    expect(saved.gestorId).toBe('gestor-id');
    expect(notificationsService.notifyManager).toHaveBeenCalledWith(saved, {
      event: 'Nova requisição',
      actorId: 'requester-id',
    });
  });

  it('rejects a gestor that does not exist', async () => {
    locationsRepository.findOne.mockResolvedValue({ id: 'location-id' });
    categoriesRepository.findOne.mockResolvedValue({ id: 'category-id' });
    usersRepository.findOne.mockResolvedValue(null);

    await expect(service.create({
      locationId: 'location-id',
      categoryId: 'category-id',
      description: 'Torneira com vazamento',
      priority: RequisitionPriority.MEDIUM,
      requesterEmail: 'user@example.com',
      requesterPhone: '',
      gestorId: 'unknown-id',
    }, 'requester-id', 'User')).rejects.toThrow('Gestor não encontrado');

    expect(requisitionsRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a gestor without the manager profile', async () => {
    locationsRepository.findOne.mockResolvedValue({ id: 'location-id' });
    categoriesRepository.findOne.mockResolvedValue({ id: 'category-id' });
    usersRepository.findOne.mockResolvedValue({ id: 'executor-id', role: UserRole.EXECUTOR });

    await expect(service.create({
      locationId: 'location-id',
      categoryId: 'category-id',
      description: 'Torneira com vazamento',
      priority: RequisitionPriority.MEDIUM,
      requesterEmail: 'user@example.com',
      requesterPhone: '',
      gestorId: 'executor-id',
    }, 'requester-id', 'User')).rejects.toThrow('não tem perfil de gestor');
  });

  it('sends a manual notification to the gestor of the requisition', async () => {
    const requisition = { requesterId: 'requester-id', executorId: 'executor-id', gestorId: 'gestor-id' };
    requisitionsRepository.findOne.mockResolvedValue(requisition);
    notificationsService.notifyManager.mockResolvedValue([{ id: 'notification-id' }]);

    const notification = await service.notifyManager(
      'requisition-id',
      { mensagem: 'Aguardando retorno do gestor' },
      UserRole.EXECUTOR,
      'executor-id',
    );

    expect(notification).toEqual({ id: 'notification-id' });
    expect(notificationsService.notifyManager).toHaveBeenCalledWith(requisition, {
      event: 'Notificação ao gestor',
      actorId: 'executor-id',
      message: 'Aguardando retorno do gestor',
      skipActor: false,
    });
  });

  it('rejects a manual notification when there is no gestor to receive it', async () => {
    requisitionsRepository.findOne.mockResolvedValue({ requesterId: 'requester-id', executorId: 'executor-id' });
    notificationsService.notifyManager.mockResolvedValue([]);

    await expect(service.notifyManager('requisition-id', {}, UserRole.EXECUTOR, 'executor-id'))
      .rejects.toThrow('Nenhum gestor disponível');
  });

  it('hides another requester\'s requisition from the manual notification', async () => {
    requisitionsRepository.findOne.mockResolvedValue({ requesterId: 'owner-id', executorId: null });

    await expect(service.notifyManager('requisition-id', {}, UserRole.REQUESTER, 'other-id'))
      .rejects.toThrow('Requisição não encontrada');

    expect(notificationsService.notifyManager).not.toHaveBeenCalled();
  });
});
