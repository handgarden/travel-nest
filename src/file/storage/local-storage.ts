import * as multer from 'multer';
import { AbstractStorage } from './abstract-storage';
import { StorageType } from './storage-type.enum';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { ResourceNotFoundException } from 'src/exception/resource-not-found.exception';

@Injectable()
export class LocalStorage extends AbstractStorage {
  private options: multer.DiskStorageOptions;
  private path: string;
  constructor(options: multer.DiskStorageOptions, path: string) {
    super(StorageType.Local, multer.diskStorage(options));
    this.path = path;
  }
  getStorage(): multer.StorageEngine {
    return this.storage;
  }

  async removeFile(storeFileName: string): Promise<void> {
    const filePath = `${this.path}/${storeFileName}`;
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      this.logger.error(err);
    }
  }

  async getFilePath(id: string) {
    const filePath = `${this.path}/${id}`;

    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return filePath;
    } catch (err) {
      throw new ResourceNotFoundException();
    }
  }
}
