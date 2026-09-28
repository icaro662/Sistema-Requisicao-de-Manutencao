import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from '../src/common/exceptions/http-exception.filter';
import { AuditResult, HistoryAction } from '../src/models/history.entity';

describe('HttpExceptionFilter', () => {
  const historyService = { record: jest.fn() };
  let filter: HttpExceptionFilter;
  let status: jest.Mock;
  let json: jest.Mock;
  let request: Record<string, unknown>;

  beforeEach(() => {
    jest.clearAllMocks();
    historyService.record.mockResolvedValue(null);
    status = jest.fn().mockReturnThis();
    json = jest.fn();
    request = { method: 'POST', url: '/api/usuarios' };

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status, json }),
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    filter = new HttpExceptionFilter(historyService as never);
    filter.catch(new HttpException('Solicitantes devem usar o cadastro público.', HttpStatus.BAD_REQUEST), host);
  });

  it('keeps the error response payload unchanged', () => {
    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: HttpStatus.BAD_REQUEST,
      path: '/api/usuarios',
    }));
  });

  it('audits authenticated failures with user, action and failure result', () => {
    request.user = { id: 'user-1', email: 'admin@empresa.com', role: 'admin' };

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status, json }),
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;
    filter.catch(new HttpException('Sem permissão', HttpStatus.FORBIDDEN), host);

    expect(historyService.record).toHaveBeenCalledWith(expect.objectContaining({
      entityType: 'sistema',
      userId: 'user-1',
      action: HistoryAction.OPERATION_FAILED,
      resultado: AuditResult.FAILURE,
      description: expect.stringContaining('POST /api/usuarios (HTTP 403)'),
    }));
  });
});
