import { Module } from '@nestjs/common';
import { JourneysService } from './journeys.service';
import { JourneysController } from './journeys.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Journey } from './entities/journey.entity';
import { JourneyContent } from './entities/journey-content';
import { Description } from 'src/descriptions/entities/description.entity';
import { DescriptionsModule } from 'src/descriptions/descriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Journey, JourneyContent, Description]),
    DescriptionsModule,
  ],
  controllers: [JourneysController],
  providers: [JourneysService],
})
export class JourneysModule {}
