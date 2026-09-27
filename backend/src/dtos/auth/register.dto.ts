import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'O nome deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres.' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres.' })
  @Matches(/^[a-zA-ZÀ-ÖØ-öø-ÿ' ]+$/, {
    message: 'O nome deve conter apenas letras e espaços (sem números ou caracteres especiais).',
  })
  name: string;

  @IsEmail({}, { message: 'Formato de e-mail inválido. Use exemplo@exemplo.com (apenas letras, números, pontos e hífens).' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @MaxLength(255, { message: 'O e-mail deve ter no máximo 255 caracteres.' })
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'Formato de e-mail inválido. Use exemplo@exemplo.com (apenas letras, números, pontos e hífens).',
  })
  email: string;

  @IsString({ message: 'A senha deve ser um texto.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
  @MaxLength(72, { message: 'A senha deve ter no máximo 72 caracteres.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/, {
    message: 'A senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial (!@#$%...).',
  })
  password: string;

  @IsOptional()
  @IsString({ message: 'O telefone deve ser um texto.' })
  @ValidateIf((_object, value) => value !== undefined && value !== '')
  @Matches(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, {
    message: 'Formato de telefone inválido. Use (00) 00000-0000.',
  })
  phone?: string;
}
