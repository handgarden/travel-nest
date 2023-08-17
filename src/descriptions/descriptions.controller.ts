import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DescriptionsService } from './descriptions.service';
import { CreateDescriptionRequest } from './dto/create-description.dto';
import { UpdateDescriptionDto } from './dto/update-description.dto';
import { EmptyContentException } from './exception/empty-content.exception';
import { MaxItemCountExceededError } from './exception/max-item-count-exceeded-exception';
import { Authorization } from 'src/auth/decorator/authorization.decorator';
import { JwtMember } from 'src/auth/decorator/jwt-member.decorator';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';

@Controller('descriptions')
export class DescriptionsController {
  constructor(private readonly descriptionsService: DescriptionsService) {}

  @Post()
  @Authorization()
  create(
    @JwtMember() member: JwtMemberDto,
    @Body() createDescriptionDto: CreateDescriptionRequest,
  ) {
    if (
      createDescriptionDto.storeFileNames.length < 1 &&
      createDescriptionDto.content.length < 20
    ) {
      throw new EmptyContentException();
    }

    if (createDescriptionDto.storeFileNames.length > 5) {
      throw new MaxItemCountExceededError();
    }

    return this.descriptionsService.create(member, createDescriptionDto);
  }

  @Get()
  findAll() {
    return this.descriptionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.descriptionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDescriptionDto: UpdateDescriptionDto,
  ) {
    return this.descriptionsService.update(+id, updateDescriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.descriptionsService.remove(+id);
  }
}
