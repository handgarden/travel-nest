import { Module } from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { DestinationsController } from './destinations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/member/entities/member.entity';
import { Destination } from './entities/destination.entity';
import { DescriptionImage } from 'src/descriptions/entities/description-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Destination, DescriptionImage])],
  controllers: [DestinationsController],
  providers: [DestinationsService],
})
export class DestinationsModule {}
