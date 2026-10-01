import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../models/category.entity';
import { Requisition } from '../models/requisition.entity';
import { AuditEntity, HistoryAction } from '../models/history.entity';
import { CreateCategoryDto } from '../dtos/categories/create-category.dto';
import { UpdateCategoryDto } from '../dtos/categories/update-category.dto';
import { HistoryService } from './history.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
    private readonly historyService: HistoryService,
  ) {}

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateCategoryDto, actor?: { id: string } | null): Promise<Category> {
    const category = this.categoriesRepository.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
    });
    const saved = await this.categoriesRepository.save(category);

    await this.historyService.record({
      entityType: AuditEntity.CATEGORY,
      entityId: saved.id,
      userId: actor?.id ?? null,
      action: HistoryAction.CATEGORY_CREATED,
      description: `Categoria ${saved.name} cadastrada`,
    });

    return saved;
  }

  async update(id: string, dto: UpdateCategoryDto, actor?: { id: string } | null): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada');

    const previousName = category.name;
    if (dto.name !== undefined) category.name = dto.name.trim();
    if (dto.description !== undefined) category.description = dto.description?.trim() || null;

    const saved = await this.categoriesRepository.save(category);

    await this.historyService.record({
      entityType: AuditEntity.CATEGORY,
      entityId: id,
      userId: actor?.id ?? null,
      action: HistoryAction.CATEGORY_UPDATED,
      description: previousName !== saved.name
        ? `Categoria ${previousName} renomeada para ${saved.name}`
        : `Categoria ${saved.name} atualizada`,
    });

    return saved;
  }

  async remove(id: string, actor?: { id: string } | null): Promise<{ id: string; removed: boolean }> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada');

    const requisitionCount = await this.requisitionsRepository.count({ where: { categoryId: id } });
    if (requisitionCount > 0) {
      throw new ConflictException('Categoria em uso por requisições e não pode ser excluída');
    }

    await this.categoriesRepository.remove(category);

    await this.historyService.record({
      entityType: AuditEntity.CATEGORY,
      entityId: id,
      userId: actor?.id ?? null,
      action: HistoryAction.CATEGORY_REMOVED,
      description: `Categoria ${category.name} excluída`,
    });

    return { id, removed: true };
  }
}
