import { StorageEngine } from 'multer';
import { AbstractStorage } from './abstract-storage';
import s3Storage = require('multer-s3');
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { StorageType } from './storage-type.enum';

type S3StorageOptions = {
  s3: S3Client;
  bucket:
    | ((
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: any, bucket?: string) => void,
      ) => void)
    | string;
  key?(
    req: Express.Request,
    file: Express.Multer.File,
    callback: (error: any, key?: string) => void,
  ): void;
  acl?:
    | ((
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: any, acl?: string) => void,
      ) => void)
    | string
    | undefined;
  contentType?(
    req: Express.Request,
    file: Express.Multer.File,
    callback: (
      error: any,
      mime?: string,
      stream?: NodeJS.ReadableStream,
    ) => void,
  ): void;
  contentDisposition?:
    | ((
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: any, contentDisposition?: string) => void,
      ) => void)
    | string
    | undefined;
  metadata?(
    req: Express.Request,
    file: Express.Multer.File,
    callback: (error: any, metadata?: any) => void,
  ): void;
  cacheControl?:
    | ((
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: any, cacheControl?: string) => void,
      ) => void)
    | string
    | undefined;
  serverSideEncryption?:
    | ((
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: any, serverSideEncryption?: string) => void,
      ) => void)
    | string
    | undefined;
};

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
