import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Matches, ValidateIf } from 'class-validator';
import { RequisitionPriority } from '../../core/enums/priority.enum';
export class CreateRequisitionDto {
	@IsUUID()
	locationId: string;

	@IsUUID()
	categoryId: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(2000)
	description: string;

	@IsEnum(RequisitionPriority)
	priority: RequisitionPriority;

	@IsEmail()
	@MaxLength(255)
	requesterEmail: string;

	@IsString()
	@MaxLength(20)
	@ValidateIf((_object, value) => value !== undefined && value !== '')
	@Matches(/^\+?[0-9 ()-]{8,20}$/, { message: 'Telefone inválido' })
	requesterPhone: string;

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

	/** Gestor responsável (recebe as notificações da requisição). */
	@IsOptional()
	@IsUUID()
	gestorId?: string;
}
