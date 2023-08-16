import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UploadedFiles,
} from '@nestjs/common';
import { FileService } from './file.service';
import { MultiFileHandler } from './decorator/multiple-file-handler.decorator';
import { MultiFileValidationPipe } from './pipe/muti-file-validator.pipe';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @MultiFileHandler([{ name: 'file' }])
  create(
    @UploadedFiles(MultiFileValidationPipe)
    file: Express.Multer.File[],
  ) {
    console.log(file);
    return this.fileService.create(file);
  }

  @Get()
  findAll() {
    return this.fileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
  //   return this.fileService.update(+id, updateFileDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileService.remove(+id);
  }
}
