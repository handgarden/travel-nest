import { StorageEngine } from 'multer';
import { AbstractStorage } from './abstract-storage';
import s3Storage = require('multer-s3');
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { StorageType } from './storage-type.enum';
import { S3StorageOptions } from 'src/config/configuration';

@Injectable()
export class S3Storage extends AbstractStorage {
  private options: S3StorageOptions;
  constructor(options: S3StorageOptions) {
    super(StorageType.S3, s3Storage(options));
    this.options = options;
  }
  getStorage(): StorageEngine {
    return this.storage;
  }

  async removeFile(storeFileName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.options.bucket as string,
      Key: storeFileName,
    });

    try {
      this.options.s3.send(command);
    } catch (err) {
      this.logger.error(err);
    }
  }
}
