import { Injectable } from '@nestjs/common';
import { CreateDescriptionRequest } from './dto/create-description.dto';
import { UpdateDescriptionDto } from './dto/update-description.dto';

@Injectable()
export class DescriptionsService {
  create(memberId: number, createDescriptionDto: CreateDescriptionRequest) {
    return 'This action adds a new description';
  }

  findAll() {
    return `This action returns all descriptions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} description`;
  }

  update(id: number, updateDescriptionDto: UpdateDescriptionDto) {
    return `This action updates a #${id} description`;
  }

  remove(id: number) {
    return `This action removes a #${id} description`;
  }
}
