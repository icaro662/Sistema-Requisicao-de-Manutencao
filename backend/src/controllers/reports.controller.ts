import { Controller, Get, Query, StreamableFile, UseGuards } from '@nestjs/common';
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
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async exportPdf(@Query() filters: FilterReportDto) {
    const file = await this.reportsService.exportPdf(filters);
    return new StreamableFile(file, {
      type: 'application/pdf',
      disposition: 'attachment; filename="relatorio-requisicoes.pdf"',
    });
  }

  @Get('export-excel')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async exportExcel(@Query() filters: FilterReportDto) {
    const file = await this.reportsService.exportExcel(filters);
    return new StreamableFile(file, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="relatorio-requisicoes.xlsx"',
    });
  }
}
