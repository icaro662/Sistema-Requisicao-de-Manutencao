import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { RequisitionPriority } from '../../core/enums/priority.enum';
import { RequisitionStatus } from '../../core/enums/status.enum';

export class FilterRequisitionDto {
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

  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
