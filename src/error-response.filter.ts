import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
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
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errBody: ErrorResponse = {
      status: exception.getStatus(),
      message: exception.message,
    };

    if (exception instanceof BadRequestException) {
      const message = exception.getResponse()['message'];
      if (message instanceof Array) {
        errBody.message = message[0] || errBody.message;
      }
    }

    const template: ResponseTemplate<null> = {
      success: false,
      response: null,
      error: errBody,
    };

    response.status(200).json(template);
  }
}
