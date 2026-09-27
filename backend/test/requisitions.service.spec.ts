import { RequisitionsService } from '../src/services/requisitions.service';
import { UserRole } from '../src/models/user.entity';
import { RequisitionStatus } from '../src/core/enums/status.enum';
import { RequisitionPriority } from '../src/core/enums/priority.enum';

describe('RequisitionsService', () => {
  const requisitionsRepository = {
    count: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const locationsRepository = { findOne: jest.fn() };
  const categoriesRepository = { findOne: jest.fn() };
  let service: RequisitionsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RequisitionsService(
      requisitionsRepository as never,
      locationsRepository as never,
      categoriesRepository as never,
    );
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
