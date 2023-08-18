import { DescriptionsService } from './../descriptions/descriptions.service';
import { Injectable } from '@nestjs/common';
import { CreateJourneyDto } from './dto/create-journey.dto';
import { UpdateJourneyDto } from './dto/update-journey.dto';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Description } from 'src/descriptions/entities/description.entity';
import { EntityManager, Repository } from 'typeorm';
import { Pageable } from 'src/common/pageable.dto';
import { PageResponse } from 'src/common/page-response.dto';
import { JourneyContentResponse } from './dto/journey-content-response.dto';
import { DescriptionResponse } from 'src/descriptions/dto/description-response.dto';
import { DestinationResponse } from 'src/destinations/dto/destination-response.dto';
import { Journey } from './entities/journey.entity';
import { Member } from 'src/member/entities/member.entity';
import { JourneyContent } from './entities/journey-content';
import { TransactionService } from 'src/transaction/transaction.service';
import { DefaultResponseMessage } from 'src/common/basic-response.enum';

@Injectable()
export class JourneysService {
  constructor(
    @InjectRepository(Description)
    private descriptionRepository: Repository<Description>,
    private descriptionsService: DescriptionsService,
    private transactionService: TransactionService,
  ) {}

  async findContents(member: JwtMemberDto, pageable: Pageable) {
    const [descriptions, total] = await this.descriptionRepository.findAndCount(
      {
        where: { creator: { id: member.id } },
        relations: { destination: true },
        take: pageable.getTake(),
        skip: pageable.getSkip(),
      },
    );

    const ids = descriptions.map((c) => c.id);

    const imageMap = await this.descriptionsService.findImagesByDescriptions(
      ids,
    );

    const response = await Promise.all(
      descriptions.map(async (c) => {
        const descripton = DescriptionResponse.create(
          member.nickname,
          c,
          imageMap.get(c.id),
        );
        const destination = DestinationResponse.create(
          member.nickname,
          await c.destination,
        );
        const content = new JourneyContentResponse();
        content.description = descripton;
        content.destination = destination;

        return content;
      }),
    );

    return new PageResponse(response, total);
  }

  async create(member: JwtMemberDto, createJourneyDto: CreateJourneyDto) {
    const creator = new Member();
    creator.id = member.id;

    const journey = new Journey();
    journey.creator = creator;
    journey.title = createJourneyDto.title;
    journey.review = createJourneyDto.review;

    const cb = async (em: EntityManager) => {
      const idJourney = await em.save(journey);

      const contents = createJourneyDto.contents.map((c) => {
        const description = new Description();
        description.id = c;

        const content = new JourneyContent();
        content.journey = Promise.resolve(idJourney);
        content.description = Promise.resolve(description);

        return content;
      });

      await em.save(contents);
    };

    await this.transactionService.transaction(cb);

    return DefaultResponseMessage.SUCCESS;
  }

  findAll() {
    return `This action returns all journeys`;
  }

  findOne(id: number) {
    return `This action returns a #${id} journey`;
  }

  update(id: number, updateJourneyDto: UpdateJourneyDto) {
    return `This action updates a #${id} journey`;
  }

  remove(id: number) {
    return `This action removes a #${id} journey`;
  }
}
