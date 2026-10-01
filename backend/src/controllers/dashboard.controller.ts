import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { DashboardService } from '../services/dashboard.service';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { DashboardFilterDto } from '../dtos/dashboard/dashboard-filter.dto';

@Controller('painel')
@UseGuards(JwtGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  summary(@Query() filters: DashboardFilterDto, @CurrentUser() user: RequestUser) {
    return this.dashboardService.summary(user.role, user.id, filters);
  }

  @Get('requisitions-by-status')
  byStatus(@Query() filters: DashboardFilterDto, @CurrentUser() user: RequestUser) {
    return this.dashboardService.summary(user.role, user.id, filters).then((s) => s.byStatus);
  }
}
