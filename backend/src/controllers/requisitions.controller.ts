import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { RequisitionsService, RequisitionQuery } from '../services/requisitions.service';
import { CreateRequisitionDto } from '../dtos/requisitions/create-requisition.dto';
import { RegisterExecutionDto } from '../dtos/requisitions/register-execution.dto';
import { UpdateRequisitionDto } from '../dtos/requisitions/update-requisition.dto';
import { UpdateStatusDto } from '../dtos/requisitions/update-status.dto';
import { AtribuirExecutorDto } from '../dtos/executors/assign-executor.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { UserRole } from '../models/user.entity';

@Controller('requisicoes')
@UseGuards(JwtGuard, RolesGuard)
export class RequisitionsController {
  constructor(private readonly requisitionsService: RequisitionsService) {}

  @Get()
  findAll(@Query() query: RequisitionQuery, @CurrentUser() user: RequestUser) {
    return this.requisitionsService.findAll(query, user.role, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.requisitionsService.findOne(id, user.role, user.id);
  }

  @Post()
  @Roles(UserRole.REQUESTER, UserRole.ADMIN)
  create(@Body() dto: CreateRequisitionDto, @CurrentUser() user: RequestUser) {
    return this.requisitionsService.create(dto, user.id, user.email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRequisitionDto, @CurrentUser() user: RequestUser) {
    return this.requisitionsService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: RequestUser) {
    return this.requisitionsService.updateStatus(id, dto, user.role, user.id);
  }

  @Post(':id/atribuir')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  assignExecutor(@Param('id') id: string, @Body() dto: AtribuirExecutorDto, @CurrentUser() _user: RequestUser) {
    return this.requisitionsService.assignExecutor(id, dto.executorId, _user.role);
  }

  @Post(':id/execucao')
  @Roles(UserRole.EXECUTOR)
  registerExecution(@Param('id') id: string, @Body() dto: RegisterExecutionDto, @CurrentUser() user: RequestUser) {
    return this.requisitionsService.registerExecution(id, dto, user.id);
  }
}
