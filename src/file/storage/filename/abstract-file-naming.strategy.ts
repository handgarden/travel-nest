import * as multer from 'multer';

export abstract class AbstractFileNamingStrategy {
  abstract createStoreFileNameCallback: multer.DiskStorageOptions['filename'];
  abstract createStoreFileName: (file: Express.Multer.File) => string;
}
