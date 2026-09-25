import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  exportPdf(): { message: string } { return { message: 'PDF export placeholder' }; }
  exportExcel(): { message: string } { return { message: 'Excel export placeholder' }; }
}
