import { Pageable } from 'src/common/pageable.dto';
import { Injectable } from '@nestjs/common';
import { CreateCommentRequest } from './dto/create-comment-request.dto';
import { JourneyComment } from './entities/journey-comment';
import { Member } from 'src/member/entities/member.entity';
import { Journey } from './entities/journey.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { JourneyCommentResponse } from './dto/journey-comment-response.dto';
import { PageResponse } from 'src/common/page-response.dto';

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
        console.log(c, nickname);
        return JourneyCommentResponse.create(nickname, c);
      }),
    );

    return new PageResponse(responses, total);
  }
}
