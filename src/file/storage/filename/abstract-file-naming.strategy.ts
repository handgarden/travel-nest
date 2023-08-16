import * as multer from 'multer';

export abstract class AbstractFileNamingStrategy {
  abstract createStoreFileName: multer.DiskStorageOptions['filename'];
}
