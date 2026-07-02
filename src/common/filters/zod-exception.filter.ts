import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';

interface ExceptionBody {
  message?: unknown;
  code?: unknown;
}

function isExceptionBody(value: unknown): value is ExceptionBody {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

@Catch()
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const requestId = `req_${crypto.randomUUID()}`;

    if (exception instanceof ZodError) {
      const errors = exception.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      response.status(HttpStatus.BAD_REQUEST).json({
        message: 'Validation failed',
        requestId,
        code: 'validation.failed',
        error: errors,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const body = isExceptionBody(exceptionResponse)
        ? exceptionResponse
        : undefined;

      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : typeof body?.message === 'string'
            ? body.message
            : exception.message;

      const code = typeof body?.code === 'string' ? body.code : 'error';

      response.status(status).json({
        message,
        requestId,
        code,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      requestId,
      code: 'server.error',
    });
  }
}
