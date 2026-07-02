import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../types/api-response';

export interface ResponseFormat {
  message: string;
  requestId: string;
  data?: unknown;
  meta?: Record<string, unknown>;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat> {
    const requestId = `req_${crypto.randomUUID()}`;

    return next.handle().pipe(
      map((data) => {
        if (data instanceof ApiResponse) {
          return {
            message: data.message,
            requestId,
            data: data.data,
            meta: data.meta,
          };
        }

        return {
          message: 'Success',
          requestId,
          data,
        };
      }),
    );
  }
}
