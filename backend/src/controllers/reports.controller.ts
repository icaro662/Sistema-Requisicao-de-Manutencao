import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { FilterReportDto } from '../dtos/reports/filter-report.dto';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { UserRole } from '../models/user.entity';
import { ReportsService } from '../services/reports.service';

@Controller('relatorios')
@UseGuards(JwtGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  findReport(@Query() filters: FilterReportDto) {
    return this.reportsService.findReport(filters);
  }

  @Get('export-pdf')
  exportPdf() { return this.reportsService.exportPdf(); }

  @Get('export-excel')
  exportExcel() { return this.reportsService.exportExcel(); }
}
