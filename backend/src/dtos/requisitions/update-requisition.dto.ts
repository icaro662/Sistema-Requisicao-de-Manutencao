import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RequisitionPriority } from '../../core/enums/priority.enum';
export class UpdateRequisitionDto { @IsOptional() @IsString() description?: string; @IsOptional() @IsEnum(RequisitionPriority) priority?: RequisitionPriority; }
