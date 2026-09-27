import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../models/category.entity';
import { Requisition } from '../models/requisition.entity';
import { CreateCategoryDto } from '../dtos/categories/create-category.dto';
import { UpdateCategoryDto } from '../dtos/categories/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
    });
    return this.categoriesRepository.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada');

    if (dto.name !== undefined) category.name = dto.name.trim();
    if (dto.description !== undefined) category.description = dto.description?.trim() || null;

    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<{ id: string; removed: boolean }> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoria não encontrada');

    const requisitionCount = await this.requisitionsRepository.count({ where: { categoryId: id } });
    if (requisitionCount > 0) {
      throw new ConflictException('Categoria em uso por requisições e não pode ser excluída');
    }

    await this.categoriesRepository.remove(category);
    return { id, removed: true };
  }
}
