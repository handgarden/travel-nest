import { Test, TestingModule } from '@nestjs/testing';
import { DescriptionsController } from './descriptions.controller';
import { DescriptionsService } from './descriptions.service';

describe('DescriptionsController', () => {
  let controller: DescriptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DescriptionsController],
      providers: [DescriptionsService],
    }).compile();

    controller = module.get<DescriptionsController>(DescriptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
