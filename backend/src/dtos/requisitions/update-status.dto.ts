import { IsEnum } from 'class-validator';
import { RequisitionStatus } from '../../core/enums/status.enum';
export class UpdateStatusDto { @IsEnum(RequisitionStatus) status: RequisitionStatus; }
