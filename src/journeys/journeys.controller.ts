import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { JourneysService } from './journeys.service';
import { CreateJourneyRequest } from './dto/create-journey-request.dto';
import { UpdateJourneyRequest } from './dto/update-journey-request.dto';
import { Authorization } from 'src/auth/decorator/authorization.decorator';
import { JwtMember } from 'src/auth/decorator/jwt-member.decorator';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { PageRequest } from 'src/common/decorator/pageRequest.decorator';
import { Pageable } from 'src/common/pageable.dto';
import { JourneysCommentService } from './journeys-comment.service';
import { CreateCommentRequest } from './dto/create-comment-request.dto';
import { UpdateCommentRequest } from './dto/update-comment-request.dto';

@Controller('journeys')
export class JourneysController {
  constructor(
    private readonly journeysService: JourneysService,
    private readonly journeysCommentService: JourneysCommentService,
  ) {}

  @Get('contents')
  @Authorization()
  getContents(
    @JwtMember() member: JwtMemberDto,
    @PageRequest() pageable: Pageable,
  ) {
    return this.journeysService.findContents(member, pageable);
  }

  @Post('item')
  @Authorization()
  create(
    @JwtMember() member: JwtMemberDto,
    @Body() createJourneyDto: CreateJourneyRequest,
  ) {
    return this.journeysService.create(member, createJourneyDto);
  }

  @Get('item')
  findAll(@PageRequest() pageable: Pageable) {
    return this.journeysService.findAll(pageable);
  }

  @Get('user')
  @Authorization()
  findAllByUser(
    @JwtMember() member: JwtMemberDto,
    @PageRequest() pageable: Pageable,
  ) {
    return this.journeysService.findAllByUser(member.id, pageable);
  }

  @Get('item/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.journeysService.findOne(+id);
  }

  @Post('item/:id')
  @Authorization()
  update(
    @JwtMember() member: JwtMemberDto,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJourneyDto: UpdateJourneyRequest,
  ) {
    return this.journeysService.update(member.id, id, updateJourneyDto);
  }

  @Delete('item/:id')
  @Authorization()
  remove(
    @JwtMember() member: JwtMemberDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.journeysService.remove(member.id, id);
  }

  //===============================================
  //COMMNET
  //===============================================
  @Get('item/:id/comments')
  getComments(
    @Param('id', ParseIntPipe) id: number,
    @PageRequest() pageable: Pageable,
  ) {
    return this.journeysCommentService.findAll(id, pageable);
  }

  @Post('item/:id/comments')
  @Authorization()
  saveComment(
    @JwtMember() member: JwtMemberDto,
    @Param('id', ParseIntPipe) id: number,
    @Body() createDto: CreateCommentRequest,
  ) {
    return this.journeysCommentService.create(member, id, createDto);
  }

  @Get('user/comments')
  @Authorization()
  getCommentsByUser(
    @JwtMember() member: JwtMemberDto,
    @PageRequest() pageable: Pageable,
  ) {
    return this.journeysCommentService.findAllByUser(member.id, pageable);
  }

  @Post('/item/comments/:id')
  @Authorization()
  updateComment(
    @JwtMember() member: JwtMemberDto,
    @Param('id', ParseIntPipe) commentId: number,
    @Body() updateDto: UpdateCommentRequest,
  ) {
    return this.journeysCommentService.update(member.id, commentId, updateDto);
  }

  @Delete('/item/comments/:id')
  @Authorization()
  deleteComment(
    @JwtMember() member: JwtMemberDto,
    @Param('id', ParseIntPipe) commentId: number,
  ) {
    return this.journeysCommentService.delete(member.id, commentId);
  }
}
