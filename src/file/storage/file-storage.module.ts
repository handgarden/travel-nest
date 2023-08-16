import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AbstractFileNamingStrategy } from './filename/abstract-file-naming.strategy';
import { UUIDFileNamingStrategy } from './filename/uuid-file-naming.strategy';
import { ConcreteStorageFactory } from './concrete-storage.factory';
import { ConfigService } from '@nestjs/config';
import { AbstractStorage } from './abstract-storage';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    {
      provide: AbstractFileNamingStrategy,
      useClass: UUIDFileNamingStrategy,
    },
    {
      provide: AbstractStorage,
      useFactory: (
        configService: ConfigService,
        namingStrategy: AbstractFileNamingStrategy,
        JwtService: JwtService,
      ) =>
        new ConcreteStorageFactory(
          configService,
          namingStrategy,
          JwtService,
        ).createStorage(),
      inject: [ConfigService, AbstractFileNamingStrategy, JwtService],
    },
  ],
  exports: [AbstractStorage],
})
export class FileStorageModule {}
