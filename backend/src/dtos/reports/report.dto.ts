import { Requisition } from '../../models/requisition.entity';

export class ReportDto {
	generatedAt: Date;
	total: number;
	rows: Requisition[];
	byStatus: Record<string, number>;
	byPeriod: Record<string, number>;
}
