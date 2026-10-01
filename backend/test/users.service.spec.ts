import { BadRequestException } from '@nestjs/common';
import { UsersService } from '../src/services/users.service';
import { AuditEntity, HistoryAction } from '../src/models/history.entity';
import { UserRole } from '../src/models/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (value: string) => `hash:${value}`),
  compare: jest.fn(),
}));

describe('UsersService (auditoria)', () => {
  const usersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    increment: jest.fn(),
  };
  const historyService = { record: jest.fn() };
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    usersRepository.create.mockImplementation((user: Record<string, unknown>) => user);
    usersRepository.save.mockImplementation(async (user: Record<string, unknown> & { id?: string }) => ({
      id: 'user-1',
      ...user,
    }));
    historyService.record.mockResolvedValue(null);
    service = new UsersService(usersRepository as never, historyService as never);
  });

  it('audits who created the user, including the responsible administrator', async () => {
    await service.createUser(
      { name: 'Carlos Dias', email: 'carlos@empresa.com', password: 'Segura@123', role: UserRole.EXECUTOR },
      { id: 'admin-1' },
    );

    expect(historyService.record).toHaveBeenCalledWith(expect.objectContaining({
      entityType: AuditEntity.USER,
      entityId: 'user-1',
      userId: 'admin-1',
      action: HistoryAction.USER_CREATED,
      description: expect.stringContaining('carlos@empresa.com'),
    }));
  });

  it('audits a public registration as self-service', async () => {
    await service.createUser({ name: 'Ana', email: 'ana@empresa.com', password: 'Segura@123' });

    expect(historyService.record).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1',
      action: HistoryAction.USER_CREATED,
      description: expect.stringContaining('Cadastro público'),
    }));
  });

  it('rejects creating a requester profile before recording anything', async () => {
    await expect(
      service.createUser({ name: 'Ana', email: 'ana@empresa.com', password: 'Segura@123', role: UserRole.REQUESTER }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(historyService.record).not.toHaveBeenCalled();
  });

  it('audits who changed the user and what changed, including role transitions', async () => {
    usersRepository.findOne.mockResolvedValue({
      id: 'user-1',
      name: 'Carlos Dias',
      email: 'carlos@empresa.com',
      role: 'executor',
      password: 'old',
      tokenVersion: 0,
    });

    await service.updateUser('user-1', { role: UserRole.MANAGER, password: 'Nova@123' }, { id: 'admin-1' });

    expect(historyService.record).toHaveBeenCalledWith(expect.objectContaining({
      entityType: AuditEntity.USER,
      entityId: 'user-1',
      userId: 'admin-1',
      action: HistoryAction.USER_UPDATED,
      description: expect.stringContaining('perfil de executor para gestor'),
    }));
  });
});
