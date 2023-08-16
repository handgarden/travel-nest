import { StorageEngine } from 'multer';
import s3Storage from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { AbstractStorage } from './abstract-storage';

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

export class S3Storage extends AbstractStorage {
  constructor(options: S3StorageOptions) {
    super(s3Storage(options));
  }
  getStorage(): StorageEngine {
    return this.storage;
  }
}
