import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuditEntity, AuditResult, HistoryAction } from '../../models/history.entity';
import { HistoryService } from '../../services/history.service';
import { RequestUser } from '../interfaces/request-user.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly historyService: HistoryService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request & { user?: RequestUser }>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: exceptionResponse,
    });

    this.recordFailure(request, status, exceptionResponse);
  }

  /**
   * Registra no log de auditoria as operações que falharam (Resultado = falha).
   * Sem usuário autenticado (token inválido/expirado, login) não há "Quem",
   * então o evento não é auditado.
   */
  private recordFailure(
    request: Request & { user?: RequestUser },
    status: number,
    exceptionResponse: unknown,
  ): void {
    const user = request.user;
    if (!user || status < 400) return;

    const method = request.method ?? 'REQUEST';
    const path = request.url ?? '';
    const message = this.describeException(exceptionResponse);
    const description = `Falha em ${method} ${path} (HTTP ${status}): ${message}`.slice(0, 500);

    void this.historyService.record({
      entityType: AuditEntity.SYSTEM,
      userId: user.id,
      action: HistoryAction.OPERATION_FAILED,
      description,
      resultado: AuditResult.FAILURE,
      resultadoDetalhe: message.slice(0, 500),
    });
  }

  private describeException(exceptionResponse: unknown): string {
    if (typeof exceptionResponse === 'string') return exceptionResponse;
    if (exceptionResponse && typeof exceptionResponse === 'object') {
      const payload = exceptionResponse as { message?: string | string[] };
      if (Array.isArray(payload.message)) return payload.message.join('; ');
      if (payload.message) return payload.message;
    }
    return 'Erro interno do servidor';
  }
}
