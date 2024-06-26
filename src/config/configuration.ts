import { S3Client } from '@aws-sdk/client-s3';
import { JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { resolve } from 'path';
import { StorageType } from 'src/file/storage/storage-type.enum';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export enum ConfigProperties {
  TypeOrmModuleOptions = 'TypeOrmModuleOptions',
  JwtModuleOptions = 'JWTModuleOptions',
  UploadFileOptions = 'UploadFileOptions',
  MulterOptions = 'MulterOptions',
  StorageOptions = 'StorageOptions',
  S3StorageOptions = 'S3StorageOptions',
}

export type StorageOptions = {
  type: StorageType;
  path: string;
};

export type S3StorageOptions = {
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

export type UploadFileOptions = {
  fileSize: number;
  maxCount: number;
};

const parseBool = (data: any) => {
  if (!data) {
    return false;
  }

  if (typeof data === 'string' && data !== 'true') {
    return false;
  }

  if (typeof data === 'number' && data !== 1) {
    return false;
  }

  return true;
};

export default () => {
  const TypeOrmModuleOptions: TypeOrmModuleOptions = {
    type: (process.env.DATABASE_TYPE as 'mysql') || 'sqlite',
    host: process.env.DATABASE_HOST || '',
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USERNAME || '',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_DATABASE || '',
    autoLoadEntities: true,
    namingStrategy: new SnakeNamingStrategy(),
    logging: parseBool(process.env.DATABASE_LOGGING),
    synchronize:
      process.env.DATABASE_SYNCHRONIZE &&
      process.env.DATABASE_SYNCHRONIZE === 'true'
        ? true
        : false,
  };

  console.log(TypeOrmModuleOptions);

  const JwtModuleOptions: JwtModuleOptions = {
    secret: process.env.JWT_SECRET || 'secret',
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN || '60s',
    },
  };

  const UploadFileOptions: UploadFileOptions = {
    fileSize: parseInt(process.env.MAX_SIZE_PER_FILE_UPLOAD) || 5 * 1000 * 1000,
    maxCount: parseInt(process.env.MAX_NUMBER_FILE_UPLOAD) || 5,
  };

  const StorageOptions: StorageOptions = {
    path: resolve(__dirname, '..', '..', process.env.FILE_DIR || 'filestore'),
    type:
      StorageType[process.env.STORAGE_TYPE.toUpperCase()] || StorageType.Local,
  };

  const S3StorageOptions: S3StorageOptions = {
    s3: new S3Client({ region: 'ap-northeast-2' }),
    bucket: process.env.S3_BUCKET_NAME || '',
  };

  return {
    [ConfigProperties.TypeOrmModuleOptions]: TypeOrmModuleOptions,
    [ConfigProperties.JwtModuleOptions]: JwtModuleOptions,
    [ConfigProperties.UploadFileOptions]: UploadFileOptions,
    [ConfigProperties.StorageOptions]: StorageOptions,
    [ConfigProperties.S3StorageOptions]: S3StorageOptions,
  };
};
