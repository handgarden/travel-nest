import { Logger } from '@nestjs/common';
import * as multer from 'multer';

export abstract class AbstractStorage {
  protected storage: multer.StorageEngine;
  protected logger: Logger;
  constructor(storageName: string, storage: multer.StorageEngine) {
    this.storage = storage;
    this.logger = new Logger(storageName);
  }

  abstract getStorage(): multer.StorageEngine;

  abstract removeFile(storeFileName: string): Promise<void>;
}
