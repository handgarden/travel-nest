import { Module } from '@nestjs/common';
import { DescriptionsService } from './descriptions.service';
import { DescriptionsController } from './descriptions.controller';

@Module({
  controllers: [DescriptionsController],
  providers: [DescriptionsService],
})
export class DescriptionsModule {}
