import * as multer from 'multer';
import { AbstractStorage } from './abstract-storage';

export class LocalStorage extends AbstractStorage {
  constructor(options: multer.DiskStorageOptions) {
    super(multer.diskStorage(options));
  }
  getStorage(): multer.StorageEngine {
    return this.storage;
  }
}
