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
import { DestinationQueryOptions } from './decorator/destination-query-options.decorator';
import { DestinationQuery } from './dto/destination-query.dto';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Post()
  @Authorization()
  create(
    @JwtMember() member: JwtMemberDto,
    @Body() createDestinationDto: CreateDestinationRequest,
  ) {
    return this.destinationsService.create(member.id, createDestinationDto);
  }

  @Get()
  findAll(@DestinationQueryOptions() query: DestinationQuery) {
    return this.destinationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.destinationsService.findOne(id);
  }

  @Patch(':id')
  @Authorization()
  update(
    @JwtMember() member: JwtMemberDto,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDestinationDto: UpdateDestinationRequest,
  ) {
    return this.destinationsService.update(member, id, updateDestinationDto);
  }

  @Delete(':id')
  @Authorization()
  remove(
    @JwtMember() member: JwtMemberDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.destinationsService.remove(member, id);
  }
}
