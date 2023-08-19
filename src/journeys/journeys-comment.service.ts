import { Pageable } from 'src/common/pageable.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCommentRequest } from './dto/create-comment-request.dto';
import { JourneyComment } from './entities/journey-comment';
import { Member } from 'src/member/entities/member.entity';
import { Journey } from './entities/journey.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { JourneyCommentResponse } from './dto/journey-comment-response.dto';
import { PageResponse } from 'src/common/page-response.dto';
import { UpdateCommentRequest } from './dto/update-comment-request.dto';
import { ResourceNotFoundException } from 'src/exception/resource-not-found.exception';
import { Role } from 'src/member/enum/Role';
import { DefaultResponseMessage } from 'src/common/basic-response.enum';

@Injectable()
export class JourneysCommentService {
  constructor(
    @InjectRepository(JourneyComment)
    private readonly commentRepository: Repository<JourneyComment>,
  ) {}
  async create(member: JwtMemberDto, id: number, dto: CreateCommentRequest) {
    const creator = new Member();
    creator.id = member.id;

    const journey = new Journey();
    journey.id = id;

    const comment = new JourneyComment();
    comment.creator = Promise.resolve(creator);
    comment.journey = journey;
    comment.content = dto.comment;

    const saved = await this.commentRepository.save(comment);

    return JourneyCommentResponse.create(member.nickname, saved);
  }

  async findAll(id: number, pageable: Pageable) {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { journey: { id } },
      relations: {
        creator: true,
      },
      order: { id: 'DESC' },
      take: pageable.getTake(),
      skip: pageable.getSkip(),
    });

    const responses = await Promise.all(
      comments.map(async (c) => {
        const nickname = (await c.creator).nickname;
        return JourneyCommentResponse.create(nickname, c);
      }),
    );

    return new PageResponse(responses, total);
  }

  async update(memberId: number, id: number, dto: UpdateCommentRequest) {
    const comments = await this.commentRepository.find({
      where: { id },
      relations: {
        creator: true,
      },
    });

    if (comments.length < 1) {
      throw new ResourceNotFoundException();
    }

    const comment = comments[0];
    const creator = await comment.creator;
    this.checkAuthorization(creator, memberId);

    //조건 확인
    if (comment.content !== dto.comment) {
      await this.commentRepository.update(id, {
        content: dto.comment,
      });
      comment.content = dto.comment;
    }
    return JourneyCommentResponse.create(creator.nickname, comment);
  }

  async delete(memberId: number, id: number) {
    const comments = await this.commentRepository.find({
      where: { id },
      relations: {
        creator: true,
      },
    });

    if (comments.length < 1) {
      return DefaultResponseMessage.SUCCESS;
    }

    const comment = comments[0];
    const creator = await comment.creator;
    this.checkAuthorization(creator, memberId);

    await this.commentRepository.remove(comment);

    return DefaultResponseMessage.SUCCESS;
  }

  checkAuthorization(member: Member, memberId: number) {
    if (member.id !== memberId) {
      throw new ForbiddenException();
    }

    if (member.role === Role.BANNED) {
      throw new ForbiddenException();
    }
  }
}
