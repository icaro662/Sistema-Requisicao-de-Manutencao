import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../models/location.entity';
import { CreateLocationDto } from '../dtos/locations/create-location.dto';
import { UpdateLocationDto } from '../dtos/locations/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,
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
    if (!location) throw new Error('Local não encontrado');

    if (dto.name !== undefined) location.name = dto.name.trim();
    if (dto.description !== undefined) location.description = dto.description?.trim() || null;

    return this.locationsRepository.save(location);
  }
}
