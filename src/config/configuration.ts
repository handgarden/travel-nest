import { JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { resolve } from 'path';

export enum ConfigProperties {
  TypeOrmModuleOptions = 'TypeOrmModuleOptions',
  JwtModuleOptions = 'JWTModuleOptions',
  UploadFileOptions = 'UploadFileOptions',
  MulterOptions = 'MulterOptions',
  StorageOptions = 'StorageOptions',
}

export enum StorageType {
  S3 = 'S3',
  Local = 'local',
}

export type StorageOptions = {
  type: StorageType;
  path: string;
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
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    autoLoadEntities: true,
    logging: parseBool(process.env.DATABASE_LOGGING),
    synchronize:
      process.env.DATABASE_SYNCHRONIZE &&
      process.env.DATABASE_SYNCHRONIZE === 'true'
        ? true
        : false,
  };

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
    type: StorageType[process.env.STORAGE_TYPE] || StorageType.Local,
  };

  return {
    [ConfigProperties.TypeOrmModuleOptions]: TypeOrmModuleOptions,
    [ConfigProperties.JwtModuleOptions]: JwtModuleOptions,
    [ConfigProperties.UploadFileOptions]: UploadFileOptions,
    [ConfigProperties.StorageOptions]: StorageOptions,
  };
};
