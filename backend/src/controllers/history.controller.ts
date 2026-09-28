import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { HistoryService } from '../services/history.service';

@Controller('requisicoes')
@UseGuards(JwtGuard, RolesGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  /** Histórico completo da requisição: data/hora, descrição e usuário responsável. */
  @Get(':id/historico')
  findRequisitionHistory(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.historyService.findByRequisition(id, { id: user.id, role: user.role });
  }
}
