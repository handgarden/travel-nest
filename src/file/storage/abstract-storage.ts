import * as multer from 'multer';

export abstract class AbstractStorage {
  protected storage: multer.StorageEngine;
  constructor(storage: multer.StorageEngine) {
    this.storage = storage;
  }

  abstract getStorage(): multer.StorageEngine;
}
