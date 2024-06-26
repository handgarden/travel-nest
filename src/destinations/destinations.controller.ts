import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { CreateDestinationRequest } from './dto/create-destination-request.dto';
import { UpdateDestinationRequest } from './dto/update-destination-request.dto';
import { Authorization } from 'src/auth/decorator/authorization.decorator';
import { JwtMember } from 'src/auth/decorator/jwt-member.decorator';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { DestinationQueryParams } from './decorator/destination-query-options.decorator';
import { DestinationQuery } from './dto/destination-query.dto';
import { PageRequest } from 'src/common/decorator/pageRequest.decorator';
import { Pageable } from 'src/common/pageable.dto';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Post('/item')
  @Authorization()
  create(
    @JwtMember() member: JwtMemberDto,
    @Body() createDestinationDto: CreateDestinationRequest,
  ) {
    return this.destinationsService.create(member.id, createDestinationDto);
  }

  @Get('/item')
  findAll(@DestinationQueryParams() query: DestinationQuery) {
    return this.destinationsService.findAll(query);
  }

  @Get('/user')
  @Authorization()
  findAllByMember(
    @JwtMember() member: JwtMemberDto,
    @DestinationQueryParams() query: DestinationQuery,
  ) {
    return this.destinationsService.findAllByMember(member.id, query);
  }

  @Get('/item/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.destinationsService.findOne(id);
  }

  @Get('item/:id/thumbnails')
  getThumbnails(
    @Param('id', ParseIntPipe) id: number,
    @PageRequest() pagable: Pageable,
  ) {
    return this.destinationsService.findThumbnails(id, pagable);
  }

  @Patch('item/:id')
  @Authorization()
  update(
    @JwtMember() member: JwtMemberDto,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDestinationDto: UpdateDestinationRequest,
  ) {
    return this.destinationsService.update(member, id, updateDestinationDto);
  }

  @Delete('item/:id')
  @Authorization()
  remove(
    @JwtMember() member: JwtMemberDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.destinationsService.remove(member, id);
  }
}
