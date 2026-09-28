import { HistoryService } from '../src/services/history.service';
import { AuditEntity, AuditResult, HistoryAction } from '../src/models/history.entity';
import { UserRole } from '../src/models/user.entity';
import { RequisitionStatus } from '../src/core/enums/status.enum';

describe('HistoryService', () => {
  const historyRepository = { create: jest.fn(), save: jest.fn(), find: jest.fn() };
  const requisitionsRepository = { findOne: jest.fn() };
  const usersRepository = { findOne: jest.fn() };
  let service: HistoryService;

  beforeEach(() => {
    jest.clearAllMocks();
    historyRepository.create.mockImplementation((entry: Record<string, unknown>) => entry);
    historyRepository.save.mockImplementation(async (entry: Record<string, unknown>) => ({ id: 'history-1', ...entry }));
    service = new HistoryService(
      historyRepository as never,
      requisitionsRepository as never,
      usersRepository as never,
    );
  });

  it('records the change with the responsible user name, description and timestamp', async () => {
    usersRepository.findOne.mockResolvedValue({ id: 'user-1', name: 'Maria Silva' });

    const entry = await service.record({
      requisitionId: 'requisition-1',
      userId: 'user-1',
      action: HistoryAction.STATUS_CHANGED,
      description: 'Status alterado de "Aberta" para "Em análise"',
      previousStatus: RequisitionStatus.OPEN,
      newStatus: RequisitionStatus.ANALYSIS,
    });

    expect(historyRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      requisitionId: 'requisition-1',
      userId: 'user-1',
      userName: 'Maria Silva',
      action: HistoryAction.STATUS_CHANGED,
      description: 'Status alterado de "Aberta" para "Em análise"',
      previousStatus: RequisitionStatus.OPEN,
      newStatus: RequisitionStatus.ANALYSIS,
    }));
    expect(historyRepository.save).toHaveBeenCalled();
    expect(entry).toMatchObject({ id: 'history-1', userName: 'Maria Silva' });
  });

  it('falls back to the informed name when the user cannot be resolved', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await service.record({
      requisitionId: 'requisition-1',
      userId: 'unknown-user',
      userName: 'executor@email.com',
      action: HistoryAction.EXECUTION_REGISTERED,
      description: 'Registro de execução salvo: troca da tomada',
    });

    expect(historyRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      userName: 'executor@email.com',
    }));
  });

  it('defaults requisition events to the audit entity "requisicao" and success result', async () => {
    usersRepository.findOne.mockResolvedValue({ id: 'user-1', name: 'Maria Silva' });

    await service.record({
      requisitionId: 'requisition-1',
      userId: 'user-1',
      action: HistoryAction.CREATED,
      description: 'Requisição criada',
    });

    expect(historyRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      requisitionId: 'requisition-1',
      entityType: 'requisicao',
      entityId: 'requisition-1',
      resultado: 'sucesso',
      resultadoDetalhe: null,
    }));
  });

  it('audits events that do not belong to a requisition with the audited entity and result', async () => {
    usersRepository.findOne.mockResolvedValue({ id: 'admin-1', name: 'Ana Admin' });

    await service.record({
      entityType: AuditEntity.USER,
      entityId: 'user-9',
      userId: 'admin-1',
      action: HistoryAction.USER_CREATED,
      description: 'Usuário criado com perfil executor',
      resultado: AuditResult.FAILURE,
      resultadoDetalhe: 'Email já cadastrado',
    });

    expect(historyRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      requisitionId: null,
      entityType: AuditEntity.USER,
      entityId: 'user-9',
      resultado: AuditResult.FAILURE,
      resultadoDetalhe: 'Email já cadastrado',
    }));
  });

  it('lists the complete history for a manager', async () => {
    requisitionsRepository.findOne.mockResolvedValue({ id: 'requisition-1', requesterId: 'requester-1', executorId: null });
    const entries = [{ id: 'history-2' }, { id: 'history-1' }];
    historyRepository.find.mockResolvedValue(entries);

    const result = await service.findByRequisition('requisition-1', { id: 'manager-1', role: UserRole.MANAGER });

    expect(historyRepository.find).toHaveBeenCalledWith({
      where: { requisitionId: 'requisition-1' },
      order: { createdAt: 'DESC' },
    });
    expect(result).toBe(entries);
  });

  it('hides the history from another requester', async () => {
    requisitionsRepository.findOne.mockResolvedValue({ id: 'requisition-1', requesterId: 'requester-1', executorId: null });

    await expect(service.findByRequisition('requisition-1', { id: 'requester-2', role: UserRole.REQUESTER }))
      .rejects.toThrow('Requisição não encontrada');

    expect(historyRepository.find).not.toHaveBeenCalled();
  });

  it('allows the assigned executor to read the history', async () => {
    requisitionsRepository.findOne.mockResolvedValue({ id: 'requisition-1', requesterId: 'requester-1', executorId: 'executor-1' });
    historyRepository.find.mockResolvedValue([]);

    await expect(service.findByRequisition('requisition-1', { id: 'executor-1', role: UserRole.EXECUTOR }))
      .resolves.toEqual([]);

    await expect(service.findByRequisition('requisition-1', { id: 'executor-2', role: UserRole.EXECUTOR }))
      .rejects.toThrow('Requisição não encontrada');
  });

  it('rejects the history when the requisition does not exist', async () => {
    requisitionsRepository.findOne.mockResolvedValue(null);

    await expect(service.findByRequisition('missing', { id: 'manager-1', role: UserRole.MANAGER }))
      .rejects.toThrow('Requisição não encontrada');
  });
});
