import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateDestinationRequest } from './dto/create-destination-request.dto';
import { UpdateDestinationRequest } from './dto/update-destination-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Destination } from './entities/destination.entity';
import { Brackets, QueryFailedError, Repository } from 'typeorm';
import { Member } from 'src/member/entities/member.entity';
import { Role } from 'src/member/enum/Role';
import { DuplicateDestinationException } from './exception/duplicate-destination.exception';
import { PageResponse } from 'src/common/page-response.dto';
import { DestinationResponse } from './dto/destination-response.dto';
import { DestinationQuery } from './dto/destination-query.dto';
import { Category } from './category.enum';
import { ResourceNotFoundException } from 'src/exception/resource-not-found.exception';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { BasicResponseMessage } from 'src/common/basic-response.enum';
import { QueryNotAffectedException } from 'src/exception/query-not-affected.exception';

@Injectable()
export class DestinationsService {
  constructor(
    @InjectRepository(Destination) private repository: Repository<Destination>,
    @InjectRepository(Member) private memberRepository: Repository<Member>,
  ) {}

  async create(
    memberId: number,
    createDestinationDto: CreateDestinationRequest,
  ) {
    const member = await this.memberRepository.findOneBy({ id: memberId });

    if (!member) {
      throw new UnauthorizedException();
    }

    this.checkIsBannedMember(member);

    const destinaton = new Destination();
    destinaton.category = createDestinationDto.category;
    destinaton.title = createDestinationDto.title;
    destinaton.address = createDestinationDto.address;
    destinaton.creator = Promise.resolve(member);

    try {
      await this.repository.save(destinaton);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UNIQUE')) {
          throw new DuplicateDestinationException();
        }
        throw error;
      }
      throw error;
    }
  }

  async findAll(destinationQuery: DestinationQuery) {
    const qb = this.repository.createQueryBuilder('destination');

    let needWhere = true;
    if (destinationQuery.category.length > 0) {
      const query = this.createCategoryQuery(destinationQuery.category);
      if (needWhere) {
        qb.where(query);
        needWhere = false;
      } else {
        qb.andWhere(query);
      }
    }

    if (destinationQuery.query) {
      const query = this.createStringQuery(destinationQuery.query);
      if (needWhere) {
        qb.where(query);
        needWhere = false;
      } else {
        qb.andWhere(query);
      }
    }

    const pageable = destinationQuery.pageable;

    const finalQuery = qb
      .select('destination.id', 'id')
      .addSelect('destination.title', 'title')
      .addSelect('destination.address', 'address')
      .addSelect('destination.category', 'category')
      .addSelect('destination.createdAt', 'createdAt')
      .addSelect('destination.updatedAt', 'updatedAt')
      .addSelect('creator.nickname', 'creatorNickname')
      .innerJoin('destination.creator', 'creator')
      .take(pageable.size)
      .skip(pageable.size * pageable.page);

    const result: DestinationResponse[] = await finalQuery.getRawMany();

    const total = await finalQuery.getCount();

    return new PageResponse(result, total);
  }

  async findOne(id: number) {
    const destination = await this.repository.find({
      where: { id },
      relations: {
        creator: true,
      },
    });

    if (destination.length < 1) {
      throw new ResourceNotFoundException();
    }

    return DestinationResponse.createResponse(destination[0]);
  }

  async update(
    member: JwtMemberDto,
    id: number,
    updateDestinationDto: UpdateDestinationRequest,
  ) {
    const destinations = await this.repository.find({
      where: { id },
      relations: { creator: true },
    });

    if (destinations.length < 1) {
      throw new ResourceNotFoundException();
    }

    const destination = destinations[0];

    const creator = await destination.creator;

    this.validateAuthorization(member, creator);

    this.checkIsBannedMember(creator);

    this.changeToRealUpdateDto(updateDestinationDto, destination);

    if (Object.getOwnPropertyNames(updateDestinationDto).length < 1) {
      return BasicResponseMessage.SUCCESS;
    }

    try {
      const result = await this.repository.update({ id }, updateDestinationDto);

      if (result.affected && result.affected < 1) {
        throw new QueryNotAffectedException();
      }

      return BasicResponseMessage.SUCCESS;
    } catch (err) {
      if (err instanceof QueryFailedError) {
        const message = err.message;
        if (message.includes('UNIQUE')) {
          throw new DuplicateDestinationException();
        }
        throw err;
      }

      throw err;
    }
  }

  async remove(requestMember: JwtMemberDto, id: number) {
    const destinations = await this.repository.find({
      where: { id },
      relations: {
        creator: true,
      },
    });

    if (destinations.length < 1) {
      return BasicResponseMessage.SUCCESS;
    }

    const destination = destinations[0];
    const creator = await destination.creator;
    this.validateAuthorization(requestMember, creator);
    this.checkIsBannedMember(creator);

    this.repository.delete({ id });
  }

  //==============================================================================

  private checkIsBannedMember(member: Member) {
    if (member.role === Role.BANNED) {
      throw new ForbiddenException();
    }
  }

  private validateAuthorization(requestMember: JwtMemberDto, creator: Member) {
    if (requestMember.id !== creator.id) {
      throw new ForbiddenException();
    }
  }

  private createCategoryQuery(categories: Category[]) {
    return new Brackets((qb) => {
      categories.forEach((c, i) => {
        if (i === 0) {
          qb.where('destination.category = :category', { category: c });
        } else {
          qb.orWhere('destination.category = :category', { category: c });
        }
      });
    });
  }

  private createStringQuery(query: string) {
    return new Brackets((qb) => {
      qb.where('destination.title LIKE :query', {
        query: `%${query}%`,
      }).orWhere('destination.address LIKE :query', {
        query: `%${query}%`,
      });
    });
  }

  private changeToRealUpdateDto(
    updateDto: UpdateDestinationRequest,
    destination: Destination,
  ) {
    if (destination.title === updateDto.title) {
      delete updateDto.title;
    }

    if (destination.address === updateDto.address) {
      delete updateDto.address;
    }
  }
}
