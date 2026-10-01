import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Corpo da notificação enviada ao gestor da requisição. */
export class NotificarGestorDto {
	@IsOptional()
	@IsString()
	@MaxLength(500)
	mensagem?: string;
}
