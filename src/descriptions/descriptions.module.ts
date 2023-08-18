import { Description } from './entities/description.entity';
import { Module } from '@nestjs/common';
import { DescriptionsService } from './descriptions.service';
import { DescriptionsController } from './descriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DescriptionImage } from './entities/description-image.entity';
import { Destination } from 'src/destinations/entities/destination.entity';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Description, DescriptionImage, Destination]),
    FileModule,
  ],
  controllers: [DescriptionsController],
  providers: [DescriptionsService],
  exports: [DescriptionsService],
})
export class DescriptionsModule {}
