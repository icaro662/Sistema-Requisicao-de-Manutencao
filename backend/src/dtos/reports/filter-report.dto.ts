import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { RequisitionPriority } from '../../core/enums/priority.enum';
import { RequisitionStatus } from '../../core/enums/status.enum';

export class FilterReportDto {
	@IsOptional()
	@IsDateString()
	from?: string;

	@IsOptional()
	@IsDateString()
	to?: string;

	@IsOptional()
	@IsUUID()
	locationId?: string;

	@IsOptional()
	@IsUUID()
	executorId?: string;

	@IsOptional()
	@IsUUID()
	categoryId?: string;

	@IsOptional()
	@IsEnum(RequisitionPriority)
	priority?: RequisitionPriority;

	@IsOptional()
	@IsEnum(RequisitionStatus)
	status?: RequisitionStatus;
}
