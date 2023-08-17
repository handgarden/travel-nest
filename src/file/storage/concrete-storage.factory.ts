import { ConfigService } from '@nestjs/config';
import { ConfigProperties, StorageOptions } from 'src/config/configuration';
import * as multer from 'multer';
import { AbstractFileNamingStrategy } from './filename/abstract-file-naming.strategy';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LocalStorage } from './local-storage';
import { S3Storage } from './s3-storage';
import { S3Client } from '@aws-sdk/client-s3';
import { AbstractStorage } from './abstract-storage';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { StorageType } from './storage-type.enum';

/**
 * ENV에 정의한 StorageType에 따라 LOCAL 혹은 S3를 반환
 * jwtService로 jwt 검증 후 파일 저장
 */
@Injectable()
export class ConcreteStorageFactory {
  constructor(
    private configService: ConfigService,
    private namingStrategy: AbstractFileNamingStrategy,
    private jwtService: JwtService,
  ) {}
  createStorage(): AbstractStorage {
    const storageOption = this.configService.get<StorageOptions>(
      ConfigProperties.StorageOptions,
    );
    if (storageOption.type === StorageType.Local) {
      return this.createLocalStorage();
    }

    return this.createS3Storage();
  }

  private createLocalStorage() {
    const path = this.configService.get<StorageOptions>(
      ConfigProperties.StorageOptions,
    ).path;
    const auth = this.authenticate;
    const options: multer.DiskStorageOptions = {
      destination: function (req, file, cb) {
        cb(auth(req), path);
      },
      filename: this.namingStrategy.createStoreFileName,
    };
    return new LocalStorage(options, path);
  }

  private createS3Storage() {
    return new S3Storage({
      s3: new S3Client(),
      bucket: 'mock',
    });
  }

  private authenticate = (req: Request) => {
    const auth = req.headers.authorization;
    if (!auth) {
      return new UnauthorizedException();
    }

    const jwt = req.headers.authorization.replace(/bearer /i, '');
    try {
      this.jwtService.verify(jwt, { ignoreExpiration: false });
      return null;
    } catch (err) {
      return new UnauthorizedException();
    }
  };
}
