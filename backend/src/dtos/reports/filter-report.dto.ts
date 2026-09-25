import { IsOptional, IsUUID } from 'class-validator';
export class FilterReportDto { @IsOptional() @IsUUID() locationId?: string; @IsOptional() from?: Date; @IsOptional() to?: Date; }
