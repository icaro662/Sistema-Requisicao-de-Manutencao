import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ErrorHandlingMiddleware implements NestMiddleware {
  use(_request: Request, _response: Response, next: NextFunction): void {
    next();
  }
}
