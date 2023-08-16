import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UploadFile } from './entities/upload-file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Member } from 'src/member/entities/member.entity';
import { Role } from 'src/member/enum/Role';
import { ResourceNotFoundException } from 'src/exception/resource-not-found.exception';
import { ConfigService } from '@nestjs/config';
import { ConfigProperties, StorageOptions } from 'src/config/configuration';
import * as fs from 'fs';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(UploadFile)
    private fileRepository: Repository<UploadFile>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async storeFiles(memberId: number, files: Express.Multer.File[]) {
    const member = await this.memberRepository.findOneBy({ id: memberId });
    this.checkAuth(member);

    const uploadFiles = files.map((f) => {
      const uplaodFile = new UploadFile();
      uplaodFile.storeFileName = f.filename;
      uplaodFile.uploadFileName = f.originalname || f.filename;
      uplaodFile.creator = member;
      return uplaodFile;
    });

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      await qr.manager.save(uploadFiles);
      return uploadFiles.map((u) => u.storeFileName);
    } catch (err) {
      await qr.rollbackTransaction();
    } finally {
      await qr.release();
    }
  }

  remove(id: number) {
    return `This action removes a #${id} file`;
  }

  private checkAuth(member: Member) {
    if (!member) {
      throw new UnauthorizedException();
    }
    if (member.role === Role.BANNED) {
      throw new ForbiddenException();
    }
  }

  /**
   * 개발용 이미지 확인
   * @param id
   * @returns
   */
  async getFilePath(id: string) {
    const path = this.configService.get<StorageOptions>(
      ConfigProperties.StorageOptions,
    ).path;

    const filePath = `${path}/${id}`;

    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return filePath;
    } catch (err) {
      throw new ResourceNotFoundException();
    }
  }
}
