import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { JourneysService } from './journeys.service';
import { CreateJourneyDto } from './dto/create-journey.dto';
import { UpdateJourneyDto } from './dto/update-journey.dto';
import { Authorization } from 'src/auth/decorator/authorization.decorator';
import { JwtMember } from 'src/auth/decorator/jwt-member.decorator';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { PageRequest } from 'src/common/decorator/pageRequest.decorator';
import { Pageable } from 'src/common/pageable.dto';

@Controller('journeys')
export class JourneysController {
  constructor(private readonly journeysService: JourneysService) {}

  @Get('contents')
  @Authorization()
  getContents(
    @JwtMember() member: JwtMemberDto,
    @PageRequest() pageable: Pageable,
  ) {
    return this.journeysService.findContents(member, pageable);
  }

  @Post()
  create(@Body() createJourneyDto: CreateJourneyDto) {
    return this.journeysService.create(createJourneyDto);
  }

  @Get()
  findAll() {
    return this.journeysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journeysService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJourneyDto: UpdateJourneyDto) {
    return this.journeysService.update(+id, updateJourneyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.journeysService.remove(+id);
  }
}
