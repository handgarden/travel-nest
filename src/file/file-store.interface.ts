import { RawFileDto } from './dto/raw-file.dto';

export interface FileStore {
  storeFiles(files: Express.Multer.File[]): RawFileDto[];

  storeFile(file: Express.Multer.File): RawFileDto;

  deleteFile(storeFileName: string): void;
}
