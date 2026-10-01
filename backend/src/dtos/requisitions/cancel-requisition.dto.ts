import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelRequisitionDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  motivo?: string;
}
