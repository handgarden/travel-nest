import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const FileHandler = (fieldName?: string, localOptions?: MulterOptions) =>
  applyDecorators(
    UseInterceptors(FileInterceptor(fieldName || 'file', localOptions)),
  );
