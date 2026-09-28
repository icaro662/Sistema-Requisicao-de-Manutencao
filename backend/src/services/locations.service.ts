import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../models/location.entity';
import { Requisition } from '../models/requisition.entity';
import { User } from '../models/user.entity';
import { AuditEntity, HistoryAction } from '../models/history.entity';
import { CreateLocationDto } from '../dtos/locations/create-location.dto';
import { UpdateLocationDto } from '../dtos/locations/update-location.dto';
import { HistoryService } from './history.service';

/** Quem realizou a operação sobre o cadastro. */
export interface ReferenceActor {
  id: string;
}

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly historyService: HistoryService,
  ) {}

  findAll(): Promise<Location[]> {
    return this.locationsRepository.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateLocationDto, actor?: ReferenceActor | null): Promise<Location> {
    const location = this.locationsRepository.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
    });
    const saved = await this.locationsRepository.save(location);

    await this.historyService.record({
      entityType: AuditEntity.LOCATION,
      entityId: saved.id,
      userId: actor?.id ?? null,
      action: HistoryAction.LOCATION_CREATED,
      description: `Local ${saved.name} cadastrado`,
    });

    return saved;
  }

  async update(id: string, dto: UpdateLocationDto, actor?: ReferenceActor | null): Promise<Location> {
    const location = await this.locationsRepository.findOne({ where: { id } });
    if (!location) throw new NotFoundException('Local não encontrado');

    const previousName = location.name;
    if (dto.name !== undefined) location.name = dto.name.trim();
    if (dto.description !== undefined) location.description = dto.description?.trim() || null;

    const saved = await this.locationsRepository.save(location);

    await this.historyService.record({
      entityType: AuditEntity.LOCATION,
      entityId: id,
      userId: actor?.id ?? null,
      action: HistoryAction.LOCATION_UPDATED,
      description: previousName !== saved.name
        ? `Local ${previousName} renomeado para ${saved.name}`
        : `Local ${saved.name} atualizado`,
    });

    return saved;
  }

  async remove(id: string, actor?: ReferenceActor | null): Promise<{ id: string; removed: boolean }> {
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

    await this.historyService.record({
      entityType: AuditEntity.LOCATION,
      entityId: id,
      userId: actor?.id ?? null,
      action: HistoryAction.LOCATION_REMOVED,
      description: `Local ${location.name} excluído`,
    });

    return { id, removed: true };
  }
}
