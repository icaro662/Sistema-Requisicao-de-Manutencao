import { IsEmail, IsEnum, IsString, IsUUID } from 'class-validator';
import { RequisitionPriority } from '../../core/enums/priority.enum';
export class CreateRequisitionDto { @IsUUID() locationId: string; @IsUUID() categoryId: string; @IsString() description: string; @IsEnum(RequisitionPriority) priority: RequisitionPriority; @IsEmail() requesterEmail: string; @IsString() requesterPhone: string; }
