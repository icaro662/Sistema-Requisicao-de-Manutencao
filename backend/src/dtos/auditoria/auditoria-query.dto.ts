import { IsEnum, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditEntity, AuditResult, HistoryAction } from '../../models/history.entity';

/**
 * Filtros do log de auditoria: usuário, data, ação, entidade e resultado.
 */
export class AuditoriaQueryDto {
  /** Nome ou id de quem executou a operação. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  usuario?: string;

  /** Tipo da operação (ex.: alteracao_status, criacao_usuario). */
  @IsOptional()
  @IsEnum(HistoryAction)
  acao?: HistoryAction;

  /** Objeto auditado (requisicao, usuario, local, categoria, sistema). */
  @IsOptional()
  @IsEnum(AuditEntity)
  entidade?: AuditEntity;

  /** Resultado da operação (sucesso ou falha). */
  @IsOptional()
  @IsEnum(AuditResult)
  resultado?: AuditResult;

  /** Data inicial (YYYY-MM-DD), considerada às 00:00. */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  de?: string;

  /** Data final (YYYY-MM-DD), considerada até 23:59. */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  ate?: string;

  /** Restringe o log ao histórico completo de uma requisição. */
  @IsOptional()
  @IsString()
  @MaxLength(36)
  requisicaoId?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
