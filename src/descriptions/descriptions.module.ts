import { Description } from './entities/description.entity';
import { Module } from '@nestjs/common';
import { DescriptionsService } from './descriptions.service';
import { DescriptionsController } from './descriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DescriptionImage } from './entities/description-image.entity';
import { Destination } from 'src/destinations/entities/destination.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Description, DescriptionImage, Destination]),
  ],
  controllers: [DescriptionsController],
  providers: [DescriptionsService],
})
export class DescriptionsModule {}
