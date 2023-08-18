import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { DescriptionsService } from './descriptions.service';
import { CreateDescriptionRequest } from './dto/create-description.dto';
import { UpdateDescriptionRequest } from './dto/update-description-request.dto';
import { EmptyContentException } from './exception/empty-content.exception';
import { MaxItemCountExceededError } from './exception/max-item-count-exceeded-exception';
import { Authorization } from 'src/auth/decorator/authorization.decorator';
import { JwtMember } from 'src/auth/decorator/jwt-member.decorator';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { PageRequest } from 'src/common/decorator/pageRequest.decorator';
import { Pageable } from 'src/common/pageable.dto';

@Controller('descriptions')
export class DescriptionsController {
  constructor(private readonly descriptionsService: DescriptionsService) {}

  @Post()
  @Authorization()
  create(
    @JwtMember() member: JwtMemberDto,
    @Body() createDescriptionDto: CreateDescriptionRequest,
  ) {
    this.validateContent(createDescriptionDto);

    return this.descriptionsService.create(member, createDescriptionDto);
  }

  @Get()
  findAll(
    @Query('destination', ParseIntPipe) destinationId: number,
    @PageRequest() pageable: Pageable,
  ) {
    return this.descriptionsService.findAll(destinationId, pageable);
  }

  @Post(':id')
  @Authorization()
  update(
    @JwtMember() member: JwtMemberDto,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDescriptionDto: UpdateDescriptionRequest,
  ) {
    this.validateContent(updateDescriptionDto);
    return this.descriptionsService.update(member.id, id, updateDescriptionDto);
  }

  @Delete(':id')
  @Authorization()
  remove(
    @JwtMember() member: JwtMemberDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.descriptionsService.remove(member.id, id);
  }

  private validateContent(
    descriptionDto: CreateDescriptionRequest | UpdateDescriptionRequest,
  ) {
    console.log(descriptionDto);
    if (
      descriptionDto.storeFileNames.length < 1 &&
      descriptionDto.content.length < 20
    ) {
      throw new EmptyContentException();
    }

    if (descriptionDto.storeFileNames.length > 5) {
      throw new MaxItemCountExceededError();
    }
  }
}
