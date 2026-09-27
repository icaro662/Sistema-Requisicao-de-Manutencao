import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { ExecutionRecordsService, RegisterExecutionDto } from '../services/execution-records.service';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { UserRole } from '../models/user.entity';

@Controller('execucoes')
@UseGuards(JwtGuard, RolesGuard)
export class ExecutionRecordsController {
  constructor(private readonly executionRecordsService: ExecutionRecordsService) {}

  @Get()
  findAll(@CurrentUser() user: RequestUser) {
    return this.executionRecordsService.findAllByExecutor(user.id);
  }

  @Get('requisicao/:id')
  findRequisitionHistory(@Param('id') id: string) {
    return this.executionRecordsService.findRequisitionHistory(id);
  }

  @Post('requisicao/:id')
  @Roles(UserRole.EXECUTOR)
  registerExecution(
    @Param('id') id: string,
    @Body() dto: RegisterExecutionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.executionRecordsService.registerExecution(id, dto, user.id, user.email);
  }

  @Post('requisicao/:id/observacao')
  @Roles(UserRole.EXECUTOR)
  addObservation(
    @Param('id') id: string,
    @Body('observacao') observation: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.executionRecordsService.addObservation(id, observation, user.id);
  }
}
