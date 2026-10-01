import { IsUUID } from 'class-validator';
export class AtribuirExecutorDto { @IsUUID() executorId: string; }
