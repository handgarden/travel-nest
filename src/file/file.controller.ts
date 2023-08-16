import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { FileService } from './file.service';
import { MultiFileHandler } from './decorator/multiple-file-handler.decorator';
import { MultiFileValidationPipe } from './pipe/muti-file-validator.pipe';
import { Authorization } from 'src/auth/decorator/authorization.decorator';
import { JwtMember } from 'src/auth/decorator/jwt-member.decorator';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { Response } from 'express';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @Authorization()
  @MultiFileHandler([{ name: 'file' }])
  saveFiles(
    @JwtMember() member: JwtMemberDto,
    @UploadedFiles(MultiFileValidationPipe)
    files: Express.Multer.File[],
  ) {
    return this.fileService.storeFiles(member.id, files);
  }

  /**
   * 로컬용, 실제에선 프론트가 s3로 요청
   * @param id 파일 id
   * @param res response
   * @returns file
   */
  @Get(':id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const path = await this.fileService.getFilePath(id);
    res.sendFile(path);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileService.remove(+id);
  }
}
