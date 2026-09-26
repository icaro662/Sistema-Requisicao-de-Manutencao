import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { DashboardService } from '../services/dashboard.service';
import { RequestUser } from '../common/interfaces/request-user.interface';

@Controller('painel')
@UseGuards(JwtGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  summary(@CurrentUser() user: RequestUser) {
    return this.dashboardService.summary(user.role, user.id);
  }

  @Get('requisitions-by-status')
  byStatus(@CurrentUser() user: RequestUser) {
    return this.dashboardService.summary(user.role, user.id).then((s) => s.byStatus);
  }
}
