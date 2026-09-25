import { IsOptional, IsString } from 'class-validator';
export class RegisterExecutionDto { @IsString() executionDescription: string; @IsOptional() @IsString() materialsUsed?: string; @IsOptional() @IsString() observations?: string; }
