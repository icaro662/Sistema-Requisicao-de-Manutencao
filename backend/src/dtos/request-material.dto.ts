import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRequestMaterialDto {
  @IsNotEmpty({ message: 'O material necessário é obrigatório.' })
  @IsString({ message: 'O campo deve ser um texto.' })
  materialsNeeded: string;

  @IsString({ message: 'O motivo deve ser um texto.' })
  reason: string;
}

export class UpdateRequestMaterialDto {
  @IsString({ message: 'O campo deve ser um texto.' })
  materialsNeeded?: string;

  @IsString({ message: 'O motivo deve ser um texto.' })
  reason?: string;
}
