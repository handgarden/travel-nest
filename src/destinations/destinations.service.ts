import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateDestinationRequest } from './dto/create-destination-request.dto';
import { UpdateDestinationRequest } from './dto/update-destination-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Destination } from './entities/destination.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { Member } from 'src/member/entities/member.entity';
import { Role } from 'src/member/enum/Role';
import { DuplicateDestinationException } from './exception/duplicate-destination.exception';

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
    destinaton.creator = member;

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

  findAll() {
    return `This action returns all destinations`;
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
}
