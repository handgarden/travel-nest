import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { AbstractFileNamingStrategy } from './abstract-file-naming.strategy';
import { v4 as uuid } from 'uuid';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UUIDFileNamingStrategy extends AbstractFileNamingStrategy {
  createStoreFileName = (
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    file: Express.Multer.File,
    callback: (error: Error, filename: string) => void,
  ) => {
    const storeFileName = this.create(file.originalname);
    callback(null, storeFileName);
  };

  private create(originalFileName: string) {
    const ext = this.extractExt(originalFileName);
    const id = uuid();
    return ext ? `${id}.${ext}` : id;
  }

  private extractExt(originalFileName: string) {
    const index = originalFileName.lastIndexOf('.');
    return originalFileName.substring(index + 1);
  }
}
