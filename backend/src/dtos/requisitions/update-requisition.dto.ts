import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength, ValidateIf } from 'class-validator';
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
	@IsNotEmpty()
	@MaxLength(2000)
	description?: string;

	@IsOptional()
	@IsEnum(RequisitionPriority)
	priority?: RequisitionPriority;

	@IsOptional()
	@IsEmail()
	@MaxLength(255)
	requesterEmail?: string;

	@IsOptional()
	@IsString()
	@MaxLength(20)
	@ValidateIf((_object, value) => value !== undefined && value !== '')
	@Matches(/^\+?[0-9 ()-]{8,20}$/, { message: 'Telefone inválido' })
	requesterPhone?: string;

	@IsOptional()
	@IsString()
	@MaxLength(30)
	@ValidateIf((_object, value) => value !== undefined && value !== '')
	@Matches(/^\+?[0-9 ()-]{8,20}$/, { message: 'WhatsApp inválido' })
	requesterWhatsapp?: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	photoUrl?: string;
}
