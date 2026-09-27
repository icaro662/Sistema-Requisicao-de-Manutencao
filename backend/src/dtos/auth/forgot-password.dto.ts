import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @MaxLength(255, { message: 'O e-mail deve ter no máximo 255 caracteres.' })
  email: string;
}
