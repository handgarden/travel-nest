import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ErrorResponse,
  ResponseTemplate,
} from 'src/response-template.interceptor';
import { ResourceNotFoundException } from './exception/resource-not-found.exception';
import { CustomHttpException } from './exception/custom-http.exception';

@Catch(
  CustomHttpException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  ResourceNotFoundException,
)
export class ErrorResponseFilter implements ExceptionFilter {
  catch(exception: CustomHttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();

    const errBody: ErrorResponse = {
      status,
      message: exception.message,
    };

    const template: ResponseTemplate<null> = {
      success: false,
      response: null,
      error: errBody,
    };

    response.status(200).json(template);
  }
}
