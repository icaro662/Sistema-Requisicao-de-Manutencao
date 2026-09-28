import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dtos/categories/create-category.dto';
import { UpdateCategoryDto } from '../dtos/categories/update-category.dto';
import { UserRole } from '../models/user.entity';

@Controller('categorias')
@UseGuards(JwtGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: RequestUser) {
    return this.categoriesService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @CurrentUser() user: RequestUser) {
    return this.categoriesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.categoriesService.remove(id, user);
  }
}
