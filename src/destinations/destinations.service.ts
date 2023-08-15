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

    if (member.role === Role.BANNED) {
      throw new ForbiddenException();
    }

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
    console.log(destinationQuery);

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
      .addSelect('destination.category', 'categoy')
      .addSelect('destination.createdAt', 'createdAt')
      .addSelect('destination.updatedAt', 'updatedAt')
      .addSelect('creator.nickname', 'creatorNickname')
      .innerJoin('destination.creator', 'creator')
      .take(pageable.size)
      .skip(pageable.size * pageable.page);

    const result: DestinationResponse[] = await finalQuery.getRawMany();

    const total = await finalQuery.getCount();
    console.log(total);

    return new PageResponse(result, total);
  }

  findOne(id: number) {
    return `This action returns a #${id} destination`;
  }

  update(id: number, updateDestinationDto: UpdateDestinationRequest) {
    return `This action updates a #${id} destination`;
  }

  remove(id: number) {
    return `This action removes a #${id} destination`;
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
}
