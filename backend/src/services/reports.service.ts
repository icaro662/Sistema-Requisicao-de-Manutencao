import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { PassThrough } from 'node:stream';
import { Repository } from 'typeorm';
import { FilterReportDto } from '../dtos/reports/filter-report.dto';
import { ReportDto } from '../dtos/reports/report.dto';
import { Requisition } from '../models/requisition.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
  ) {}

  async findReport(filters: FilterReportDto): Promise<ReportDto> {
    const query = this.requisitionsRepository.createQueryBuilder('requisition');

    if (filters.from) query.andWhere('requisition.createdAt >= :from', { from: filters.from });
    if (filters.to) query.andWhere('requisition.createdAt <= :to', { to: filters.to });
    if (filters.locationId) query.andWhere('requisition.locationId = :locationId', { locationId: filters.locationId });
    if (filters.executorId) query.andWhere('requisition.executorId = :executorId', { executorId: filters.executorId });
    if (filters.categoryId) query.andWhere('requisition.categoryId = :categoryId', { categoryId: filters.categoryId });
    if (filters.priority) query.andWhere('requisition.priority = :priority', { priority: filters.priority });
    if (filters.status) query.andWhere('requisition.status = :status', { status: filters.status });

    const rows = await query.orderBy('requisition.createdAt', 'DESC').getMany();
    const byStatus = rows.reduce<Record<string, number>>((summary, requisition) => {
      summary[requisition.status] = (summary[requisition.status] ?? 0) + 1;
      return summary;
    }, {});
    const byPeriod = rows.reduce<Record<string, number>>((summary, requisition) => {
      const period = requisition.createdAt.toISOString().slice(0, 7);
      summary[period] = (summary[period] ?? 0) + 1;
      return summary;
    }, {});

    return { generatedAt: new Date(), total: rows.length, rows, byStatus, byPeriod };
  }

  async exportPdf(filters: FilterReportDto): Promise<Buffer> {
    const report = await this.findReport(filters);
    const document = new PDFDocument({ margin: 40 });
    const output = new PassThrough();
    const chunks: Buffer[] = [];

    document.pipe(output);
    document.fontSize(18).text('Relatório de requisições', { align: 'center' });
    document.moveDown();
    document.fontSize(10).text(`Gerado em: ${report.generatedAt.toLocaleString('pt-BR')}`);
    document.text(`Total de requisições: ${report.total}`);
    document.moveDown();

    report.rows.forEach((row) => {
      document.fontSize(10).text(`${row.number} | ${row.status} | ${row.priority} | ${row.description}`);
      document.text(`Local: ${row.locationId} | Categoria: ${row.categoryId}`);
      document.moveDown(0.5);
    });

    const result = new Promise<Buffer>((resolve, reject) => {
      output.on('data', (chunk: Buffer) => chunks.push(chunk));
      output.on('end', () => resolve(Buffer.concat(chunks)));
      output.on('error', reject);
    });
    document.end();
    return result;
  }

  async exportExcel(filters: FilterReportDto): Promise<Buffer> {
    const report = await this.findReport(filters);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Requisições');

    worksheet.columns = [
      { header: 'Número', key: 'number', width: 16 },
      { header: 'Status', key: 'status', width: 22 },
      { header: 'Prioridade', key: 'priority', width: 14 },
      { header: 'Descrição', key: 'description', width: 45 },
      { header: 'Local', key: 'locationId', width: 38 },
      { header: 'Categoria', key: 'categoryId', width: 38 },
      { header: 'Criada em', key: 'createdAt', width: 22 },
    ];
    report.rows.forEach((row) => worksheet.addRow({
      number: row.number,
      status: row.status,
      priority: row.priority,
      description: row.description,
      locationId: row.locationId,
      categoryId: row.categoryId,
      createdAt: row.createdAt,
    }));
    worksheet.getRow(1).font = { bold: true };

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
