import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const MultiFileHandler = (fields: MulterField[]) =>
  applyDecorators(UseInterceptors(FileFieldsInterceptor(fields)));
