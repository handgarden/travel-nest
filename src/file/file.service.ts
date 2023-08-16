import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
  create(files: Express.Multer.File[]) {
    this.storeFiles(files);

    return 'This action adds a new file';
  }

  async storeFiles(files: Express.Multer.File[]) {
    for (const file of files) {
      console.log(file.originalname, file.filename);
    }
  }

  // async storeFile() {}

  findAll() {
    return `This action returns all file`;
  }

  findOne(id: number) {
    return `This action returns a #${id} file`;
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }
}
