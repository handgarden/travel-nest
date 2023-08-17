import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { ConfigService } from '@nestjs/config';
import { MultiFileValidationPipe } from './pipe/muti-file-validator.pipe';
import { MulterModule } from '@nestjs/platform-express';
import { FileStorageModule } from './storage/file-storage.module';
import { AbstractStorage } from './storage/abstract-storage';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFile } from './entities/upload-file.entity';
import { Member } from 'src/member/entities/member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadFile, Member]),
    MulterModule.registerAsync({
      imports: [FileStorageModule],
      useFactory: (storage: AbstractStorage) => ({
        storage: storage.getStorage(),
      }),
      inject: [AbstractStorage],
    }),
    FileStorageModule,
  ],
  controllers: [FileController],
  providers: [
    FileService,
    {
      provide: MultiFileValidationPipe,
      useFactory: (configService: ConfigService) =>
        new MultiFileValidationPipe(configService),
      inject: [ConfigService],
    },
  ],
})
export class FileModule {}
