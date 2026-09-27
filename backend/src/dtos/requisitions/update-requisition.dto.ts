import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { RequisitionPriority } from '../../core/enums/priority.enum';
export class UpdateRequisitionDto {
	@IsOptional()
	@IsUUID()
	locationId?: string;

	@IsOptional()
	@IsUUID()
	categoryId?: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsEnum(RequisitionPriority)
	priority?: RequisitionPriority;

	@IsOptional()
	@IsEmail()
	requesterEmail?: string;

	@IsOptional()
	@IsString()
	requesterPhone?: string;

	@IsOptional()
	@IsString()
	photoUrl?: string;
}
