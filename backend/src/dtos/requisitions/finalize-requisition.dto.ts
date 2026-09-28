import { IsOptional, IsString, MaxLength } from 'class-validator';

export class FinalizeRequisitionDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  executionDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  materialsUsed?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observations?: string;
}
