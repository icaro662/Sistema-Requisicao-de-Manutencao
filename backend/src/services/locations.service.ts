import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../models/location.entity';
import { Requisition } from '../models/requisition.entity';
import { User } from '../models/user.entity';
import { CreateLocationDto } from '../dtos/locations/create-location.dto';
import { UpdateLocationDto } from '../dtos/locations/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<Location[]> {
    return this.locationsRepository.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateLocationDto): Promise<Location> {
    const location = this.locationsRepository.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
    });
    return this.locationsRepository.save(location);
  }

  async update(id: string, dto: UpdateLocationDto): Promise<Location> {
    const location = await this.locationsRepository.findOne({ where: { id } });
    if (!location) throw new NotFoundException('Local não encontrado');

    if (dto.name !== undefined) location.name = dto.name.trim();
    if (dto.description !== undefined) location.description = dto.description?.trim() || null;

    return this.locationsRepository.save(location);
  }

  async remove(id: string): Promise<{ id: string; removed: boolean }> {
    const location = await this.locationsRepository.findOne({ where: { id } });
    if (!location) throw new NotFoundException('Local não encontrado');

    const [requisitionCount, userCount] = await Promise.all([
      this.requisitionsRepository.count({ where: { locationId: id } }),
      this.usersRepository.count({ where: { locationId: id } }),
    ]);

    if (requisitionCount > 0 || userCount > 0) {
      throw new ConflictException('Local em uso por requisições ou usuários e não pode ser excluído');
    }

    await this.locationsRepository.remove(location);
    return { id, removed: true };
  }
}
