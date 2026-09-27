import { unlink } from 'node:fs/promises';
import { UserRole } from '../src/models/user.entity';
import { UploadService } from '../src/services/upload.service';

jest.mock('node:fs/promises', () => ({
  unlink: jest.fn(),
}));

describe('UploadService', () => {
  const uploadedFilesRepository = {
    create: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };
  let service: UploadService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UploadService(uploadedFilesRepository as never);
    (unlink as jest.Mock).mockResolvedValue(undefined);
  });

  it('allows the file owner to remove an uploaded file', async () => {
    uploadedFilesRepository.findOne.mockResolvedValue({ filename: 'photo.jpg', ownerId: 'owner-id' });

    await expect(service.remove('photo.jpg', 'owner-id', UserRole.REQUESTER))
      .resolves.toEqual({ filename: 'photo.jpg', removed: true });

    expect(unlink).toHaveBeenCalled();
    expect(uploadedFilesRepository.delete).toHaveBeenCalledWith({ filename: 'photo.jpg' });
  });

  it('denies removal by another user', async () => {
    uploadedFilesRepository.findOne.mockResolvedValue(null);

    await expect(service.remove('photo.jpg', 'other-id', UserRole.REQUESTER))
      .rejects.toThrow('Você não pode remover este arquivo');

    expect(unlink).not.toHaveBeenCalled();
  });

  it('allows administrators to remove any file', async () => {
    await expect(service.remove('photo.jpg', 'admin-id', UserRole.ADMIN))
      .resolves.toEqual({ filename: 'photo.jpg', removed: true });

    expect(unlink).toHaveBeenCalled();
  });

  it('cleans the database record when the physical file is missing', async () => {
    uploadedFilesRepository.findOne.mockResolvedValue({ filename: 'photo.jpg', ownerId: 'owner-id' });
    (unlink as jest.Mock).mockRejectedValueOnce(Object.assign(new Error('missing'), { code: 'ENOENT' }));

    await expect(service.remove('photo.jpg', 'owner-id', UserRole.REQUESTER))
      .rejects.toThrow('Arquivo não encontrado');

    expect(uploadedFilesRepository.delete).toHaveBeenCalledWith({ filename: 'photo.jpg' });
  });
});
