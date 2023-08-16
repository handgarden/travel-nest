import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigProperties, UploadFileOptions } from 'src/config/configuration';
import { EmptyFileListException } from '../exception/empty-file-list.exception';
import { MaxFileCountExceededException } from '../exception/max-file-count-exceeded.exception';
import { MaxFileSizeExceedException } from '../exception/max-file-size-exceeded.exception';

@Injectable()
export class MultiFileValidationPipe implements PipeTransform {
  private fileSize: number;
  private maxCount: number;
  constructor(configService: ConfigService) {
    const config = configService.get<UploadFileOptions>(
      ConfigProperties.UploadFileOptions,
    );
    this.fileSize = config.fileSize;
    this.maxCount = config.maxCount;
  }
  transform(
    value: { file: Express.Multer.File[] },
    metadata: ArgumentMetadata,
  ) {
    if (!value || !value.file || value.file.length < 1) {
      throw new EmptyFileListException();
    }
    const files = value.file;

    if (files.length > this.maxCount) {
      throw new MaxFileCountExceededException();
    }

    for (const file of files) {
      if (file.size > this.fileSize) {
        throw new MaxFileSizeExceedException();
      }
    }

    return value.file;
  }
}
