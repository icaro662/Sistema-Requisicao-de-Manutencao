import { Controller, Get } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  summary() { return this.dashboardService.summary(); }

  @Get('requisitions-by-status')
  byStatus() { return this.dashboardService.summary().byStatus; }
}
