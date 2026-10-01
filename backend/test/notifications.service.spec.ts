import { CommunicationChannel, CommunicationOutcome } from '../src/core/enums/communication.enum';
import { RequisitionStatus } from '../src/core/enums/status.enum';
import { UserRole } from '../src/models/user.entity';
import { NotificationsService } from '../src/services/notifications.service';

describe('NotificationsService', () => {
  const requisitionsRepository = { createQueryBuilder: jest.fn() };
  const notificationsRepository = {
    find: jest.fn(),
    create: jest.fn((value: unknown) => value),
    save: jest.fn(),
  };
  const communicationsRepository = {
    find: jest.fn(),
    create: jest.fn((value: unknown) => value),
    save: jest.fn(),
  };
  const usersRepository = { findOne: jest.fn(), find: jest.fn() };
  const locationsRepository = { findOne: jest.fn() };
  const emailProvider = { send: jest.fn() };

  const gestor = { id: 'gestor-id', name: 'Gestor Dev', email: 'gestor@dev.com', role: UserRole.MANAGER, isActive: true };
  const requisition = {
    id: 'requisition-id',
    number: 'REQ-00003',
    status: RequisitionStatus.IN_SERVICE,
    executorId: 'executor-id',
    locationId: 'location-id',
    gestorId: 'gestor-id',
  };

  let service: NotificationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationsRepository.save.mockImplementation(async (value: { id?: string }) => ({ id: 'notification-id', ...value }));
    communicationsRepository.save.mockImplementation(async (value: unknown) => value);
    usersRepository.findOne.mockImplementation(async ({ where }: { where: { id: string } }) =>
      (where.id === 'executor-id' ? { id: 'executor-id', name: 'Ana Executor' } : gestor));
    usersRepository.find.mockResolvedValue([]);
    locationsRepository.findOne.mockResolvedValue({ id: 'location-id', name: 'Almoxarifado' });
    emailProvider.send.mockResolvedValue({ outcome: CommunicationOutcome.SENT });

    service = new NotificationsService(
      requisitionsRepository as never,
      notificationsRepository as never,
      communicationsRepository as never,
      usersRepository as never,
      locationsRepository as never,
      emailProvider as never,
    );
  });

  it('notifies the requisition gestor with the full template', async () => {
    const created = await service.notifyManager(requisition as never, {
      event: 'Status atualizado',
      previousStatus: RequisitionStatus.OPEN,
      actorId: 'executor-id',
    });

    expect(created).toHaveLength(1);
    expect(notificationsRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      requisitionId: 'requisition-id',
      requisitionNumber: 'REQ-00003',
      recipientId: 'gestor-id',
      status: RequisitionStatus.IN_SERVICE,
      message: 'Status alterado de "Aberta" para "Em atendimento"',
    }));
    expect(emailProvider.send).toHaveBeenCalledWith(
      'gestor@dev.com',
      '[REQ-00003] Status atualizado — Em atendimento',
      expect.stringContaining('Ana Executor'),
    );
  });

  it('records one application communication and one e-mail communication', async () => {
    await service.notifyManager(requisition as never, { event: 'Status atualizado', actorId: 'executor-id' });

    const channels = communicationsRepository.save.mock.calls.map(([row]) => row.channel as CommunicationChannel);
    expect(channels).toEqual([CommunicationChannel.APPLICATION, CommunicationChannel.EMAIL]);

    const [application, email] = communicationsRepository.save.mock.calls.map(([row]) => row);
    expect(application).toEqual(expect.objectContaining({
      recipientName: 'Gestor Dev',
      recipientEmail: 'gestor@dev.com',
      outcome: CommunicationOutcome.SENT,
    }));
    expect(email).toEqual(expect.objectContaining({ channel: CommunicationChannel.EMAIL }));
  });

  it('records a failed e-mail without losing the in-app notification', async () => {
    emailProvider.send.mockResolvedValue({ outcome: CommunicationOutcome.FAILED, detail: 'SMTP indisponível' });

    const created = await service.notifyManager(requisition as never, { event: 'Status atualizado', actorId: 'executor-id' });

    expect(created).toHaveLength(1);
    const email = communicationsRepository.save.mock.calls.at(-1)?.[0];
    expect(email).toEqual(expect.objectContaining({
      channel: CommunicationChannel.EMAIL,
      outcome: CommunicationOutcome.FAILED,
      detail: 'SMTP indisponível',
    }));
  });

  it('notifies the whole manager team when the requisition has no gestor', async () => {
    usersRepository.find.mockResolvedValue([
      { ...gestor, id: 'gestor-1' },
      { ...gestor, id: 'gestor-2' },
    ]);

    const created = await service.notifyManager(
      { ...requisition, gestorId: null } as never,
      { event: 'Nova requisição', actorId: 'requester-id' },
    );

    expect(created).toHaveLength(2);
    const recipients = notificationsRepository.save.mock.calls.map(([row]) => row.recipientId);
    expect(recipients).toEqual(['gestor-1', 'gestor-2']);
  });

  it('returns nothing when there is no manager available', async () => {
    usersRepository.find.mockResolvedValue([]);

    const created = await service.notifyManager(
      { ...requisition, gestorId: null } as never,
      { event: 'Nova requisição', actorId: 'requester-id' },
    );

    expect(created).toEqual([]);
    expect(notificationsRepository.save).not.toHaveBeenCalled();
    expect(emailProvider.send).not.toHaveBeenCalled();
  });

  it('does not notify the author of the event by default', async () => {
    const created = await service.notifyManager(requisition as never, {
      event: 'Executor atribuído',
      actorId: 'gestor-id',
    });

    expect(created).toEqual([]);
    expect(notificationsRepository.save).not.toHaveBeenCalled();
  });

  it('notifies the author when the action is an explicit request', async () => {
    const created = await service.notifyManager(requisition as never, {
      event: 'Notificação ao gestor',
      actorId: 'gestor-id',
      skipActor: false,
    });

    expect(created).toHaveLength(1);
  });

  it('never throws when something goes wrong while notifying', async () => {
    notificationsRepository.save.mockRejectedValue(new Error('db down'));

    const created = await service.notifyManager(requisition as never, { event: 'Status atualizado' });

    expect(created).toEqual([]);
  });

  it('returns the stored notifications addressed to the manager', async () => {
    const createdAt = new Date('2026-09-28T12:00:00Z');
    notificationsRepository.find.mockResolvedValue([{
      id: 'notification-id',
      message: 'Status alterado de "Aberta" para "Em atendimento"',
      requisitionId: 'requisition-id',
      requisitionNumber: 'REQ-00003',
      status: RequisitionStatus.IN_SERVICE,
      createdAt,
    }]);

    const notifications = await service.findForUser('gestor-id', UserRole.MANAGER);

    expect(notificationsRepository.find).toHaveBeenCalledWith(expect.objectContaining({
      where: { recipientId: 'gestor-id' },
    }));
    expect(notifications[0]).toEqual(expect.objectContaining({
      id: 'notification-id',
      requisitionNumber: 'REQ-00003',
      read: false,
    }));
  });

  it('keeps deriving notifications from requisitions for the requester', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{
        id: 'requisition-id',
        number: 'REQ-00003',
        status: RequisitionStatus.OPEN,
        createdAt: new Date('2026-09-28T12:00:00Z'),
      }]),
    };
    requisitionsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const notifications = await service.findForUser('requester-id', UserRole.REQUESTER);

    expect(queryBuilder.where).toHaveBeenCalledWith('r.requesterId = :userId', { userId: 'requester-id' });
    expect(notifications[0].message).toBe('Solicitação REQ-00003 atualizada');
    expect(notificationsRepository.find).not.toHaveBeenCalled();
  });

  it('lists the communication history most recent first', async () => {
    communicationsRepository.find.mockResolvedValue([{ id: 'communication-id' }]);

    const communications = await service.listCommunications();

    expect(communicationsRepository.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
      take: 100,
    });
    expect(communications).toEqual([{ id: 'communication-id' }]);
  });
});
