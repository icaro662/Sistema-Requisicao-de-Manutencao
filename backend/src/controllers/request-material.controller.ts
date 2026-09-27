import { Body, Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { RequestMaterialService } from '../services/request-material.service';
import { CreateRequestMaterialDto } from '../dtos/request-material.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { UserRole } from '../models/user.entity';

@Controller('materiais')
@UseGuards(JwtGuard, RolesGuard)
export class RequestMaterialController {
  constructor(private readonly requestMaterialService: RequestMaterialService) {}

  @Get('requisicao/:id')
  findByRequisitionId(@Param('id') id: string) {
    return this.requestMaterialService.findByRequisitionId(id);
  }

  @Post('requisicao/:id')
  @Roles(UserRole.EXECUTOR)
  create(@Param('id') id: string, @Body() dto: CreateRequestMaterialDto, @CurrentUser() user: RequestUser) {
    return this.requestMaterialService.create(id, dto);
  }
}
