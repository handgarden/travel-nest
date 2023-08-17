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
import { ConfigService } from '@nestjs/config';
import { AbstractStorage } from './storage/abstract-storage';
import { LocalStorage } from './storage/local-storage';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(UploadFile)
    private fileRepository: Repository<UploadFile>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
    private dataSource: DataSource,
    private configService: ConfigService,
    private fileStorage: AbstractStorage,
  ) {}

  async storeFiles(memberId: number, files: Express.Multer.File[]) {
    const member = await this.memberRepository.findOneBy({ id: memberId });
    this.checkAuth(member);

    const uploadFiles = files.map((f) => {
      const uplaodFile = new UploadFile();
      uplaodFile.storeFileName = f.filename;
      uplaodFile.uploadFileName = f.originalname || f.filename;
      uplaodFile.creator = Promise.resolve(member);
      return uplaodFile;
    });

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      await qr.manager.save(uploadFiles);
      await qr.commitTransaction();
      return uploadFiles.map((u) => u.storeFileName);
    } catch (err) {
      await qr.rollbackTransaction();
    } finally {
      await qr.release();
    }
  }

  async remove(memberId: number, storeFileName: string) {
    const files = await this.fileRepository.find({
      where: { storeFileName },
      relations: { creator: true },
    });

    if (files.length < 1) {
      return true;
    }

    const file = files[0];
    const member = await file.creator;

    if (memberId !== member.id) {
      throw new ForbiddenException();
    }

    this.checkAuth(member);

    await this.fileRepository.remove(file);

    await this.fileStorage.removeFile(storeFileName);
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
   * @param storeFileName
   * @returns
   */
  async getFilePath(storeFileName: string) {
    if (!(this.fileStorage instanceof LocalStorage)) {
      throw new Error('로컬 스토리지가 아닙니다.');
    }

    return this.fileStorage.getFilePath(storeFileName);
  }
}
