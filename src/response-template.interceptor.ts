import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export type ErrorResponse = {
  message: string;
  error?: string;
  status: number;
};

export interface ResponseTemplate<T> {
  success: boolean;
  response: T;
  error: ErrorResponse | null;
}

@Injectable()
export class ResponseTemplateInterceptor
  implements NestInterceptor<any, ResponseTemplate<any>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ):
    | Observable<ResponseTemplate<any>>
    | Promise<Observable<ResponseTemplate<any>>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        response: data !== undefined ? data : null,
        error: null,
      })),
    );
  }
}
