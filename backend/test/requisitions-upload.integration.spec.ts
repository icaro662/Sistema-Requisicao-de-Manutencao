import { unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RequisitionPriority } from '../src/core/enums/priority.enum';
import { RequisitionStatus } from '../src/core/enums/status.enum';
import { uploadDirectory } from '../src/core/multer.config';
import { Requisition } from '../src/models/requisition.entity';
import { RequisitionsService } from '../src/services/requisitions.service';
import { UploadService } from '../src/services/upload.service';

describe('Requisition upload flow', () => {
  const uploadedFilesRepository = {
    create: jest.fn((value) => value),
    delete: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const requisitionsRepository = {
    count: jest.fn(),
    create: jest.fn((value) => value),
    findOne: jest.fn(),
    save: jest.fn((value) => Promise.resolve(value)),
  };
  const locationsRepository = { findOne: jest.fn() };
  const categoriesRepository = { findOne: jest.fn() };
  const historyService = { record: jest.fn(), describeUser: jest.fn() };
  const filename = `integration-${Date.now()}.png`;
  const filepath = join(uploadDirectory, filename);
  let uploadService: UploadService;
  let requisitionsService: RequisitionsService;

  beforeAll(async () => {
    await writeFile(filepath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    uploadedFilesRepository.save.mockResolvedValue(undefined);
    locationsRepository.findOne.mockResolvedValue({ id: 'location-id' });
    categoriesRepository.findOne.mockResolvedValue({ id: 'category-id' });
    requisitionsRepository.count.mockResolvedValue(0);
    uploadService = new UploadService(uploadedFilesRepository as never);
    historyService.record.mockResolvedValue(null);
    historyService.describeUser.mockResolvedValue('User');
    requisitionsService = new RequisitionsService(
      requisitionsRepository as never,
      locationsRepository as never,
      categoriesRepository as never,
      historyService as never,
    );
  });

  afterAll(async () => {
    await unlink(filepath).catch(() => undefined);
  });

  it('associates an uploaded photo with a new requisition', async () => {
    await uploadService.register(filename, 'requester-id');

    const requisition = await requisitionsService.create({
      locationId: 'location-id',
      categoryId: 'category-id',
      description: 'Torneira com vazamento',
      priority: RequisitionPriority.MEDIUM,
      requesterEmail: 'user@example.com',
      requesterPhone: '',
      photoUrl: `/uploads/${filename}`,
    }, 'requester-id', 'User');

    expect(requisition).toMatchObject<Partial<Requisition>>({
      requesterId: 'requester-id',
      photoUrl: `/uploads/${filename}`,
      status: RequisitionStatus.OPEN,
    });
    expect(uploadedFilesRepository.save).toHaveBeenCalled();
    expect(requisitionsRepository.save).toHaveBeenCalledWith(requisition);
  });
});
