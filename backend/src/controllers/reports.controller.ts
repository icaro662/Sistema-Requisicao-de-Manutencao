import { Controller, Get } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';

@Controller('relatorios')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('export-pdf')
  exportPdf() { return this.reportsService.exportPdf(); }

  @Get('export-excel')
  exportExcel() { return this.reportsService.exportExcel(); }
}
