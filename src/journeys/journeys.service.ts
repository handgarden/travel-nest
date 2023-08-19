import { DescriptionsService } from './../descriptions/descriptions.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateJourneyRequest } from './dto/create-journey-request.dto';
import { UpdateJourneyRequest } from './dto/update-journey-request.dto';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Description } from 'src/descriptions/entities/description.entity';
import { EntityManager, In, Repository } from 'typeorm';
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
import { JourneyResponse } from './dto/journey-response.dto';
import { ResourceNotFoundException } from 'src/exception/resource-not-found.exception';
import { Role } from 'src/member/enum/Role';

@Injectable()
export class JourneysService {
  constructor(
    @InjectRepository(Description)
    private descriptionRepository: Repository<Description>,
    private descriptionsService: DescriptionsService,
    private transactionService: TransactionService,
    @InjectRepository(Journey)
    private journeyRepository: Repository<Journey>,
    @InjectRepository(JourneyContent)
    private contentRepository: Repository<JourneyContent>,
  ) {}

  async findContents(member: JwtMemberDto, pageable: Pageable) {
    const [descriptions, total] = await this.descriptionRepository.findAndCount(
      {
        where: { creator: { id: member.id } },
        relations: {
          destination: {
            creator: true,
          },
          creator: true,
        },
        take: pageable.getTake(),
        skip: pageable.getSkip(),
      },
    );

    const contents = await Promise.all(
      descriptions.map(async (d) => {
        const content = new JourneyContent();
        content.description = Promise.resolve(d);
        return content;
      }),
    );

    const response = await this.createJourneyContentResponse(contents);

    return new PageResponse(response, total);
  }

  async create(member: JwtMemberDto, createJourneyDto: CreateJourneyRequest) {
    const creator = new Member();
    creator.id = member.id;

    const journey = new Journey();
    journey.creator = Promise.resolve(creator);
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
        content.journeyId = idJourney.id;

        return content;
      });

      await em.save(contents);
    };

    await this.transactionService.transaction(cb);

    return DefaultResponseMessage.SUCCESS;
  }

  async findAll(pageable: Pageable) {
    //Journey 조회
    const [journeys, total] = await this.journeyRepository.findAndCount({
      relations: { creator: true },
      order: {
        id: 'DESC',
      },
      take: pageable.getTake(),
      skip: pageable.getSkip(),
    });

    //Journey 컨텐츠 조회를 위해서 id 배열 생성
    const ids = journeys.map((j) => j.id);
    //컨텐츠 조회
    const contents = await this.contentRepository.find({
      where: { journey: { id: In(ids) } },
      relations: {
        description: {
          destination: {
            creator: true,
          },
          creator: true,
        },
      },
      order: { journey: { id: 'DESC' }, id: 'ASC' },
    });

    //resonsedto로 변경
    const contentResponses = await this.createJourneyContentResponse(contents);

    //journeyResponse에 컨텐츠 넣어주기 위해서 journeyId - content[] Map 생성
    const journeyIdContentMap = new Map<number, JourneyContentResponse[]>();
    ids.forEach((i) => journeyIdContentMap.set(i, []));
    contentResponses.forEach((r) => {
      journeyIdContentMap.get(r.journeyId).push(r);
    });

    //journeyResponse 생성
    const responses = await Promise.all(
      journeys.map(async (j) => {
        const res = new JourneyResponse();
        res.id = j.id;
        res.title = j.title;
        res.review = j.review;
        res.creatorNickname = (await j.creator).nickname;
        res.createdAt = j.createdAt;
        res.updatedAt = j.updatedAt;
        res.journeyContents = journeyIdContentMap.get(j.id);
        return res;
      }),
    );

    return new PageResponse(responses, total);
  }

  async findOne(id: number) {
    //Journey 조회
    const journeys = await this.journeyRepository.find({
      where: { id },
      relations: { creator: true },
    });

    if (journeys.length < 1) {
      throw new ResourceNotFoundException();
    }

    //Journey 컨텐츠 조회를 위해서 id 배열 생성
    //컨텐츠 조회
    const contents = await this.contentRepository.find({
      where: { journey: { id } },
      relations: {
        description: {
          destination: {
            creator: true,
          },
          creator: true,
        },
      },
      order: { id: 'ASC' },
    });

    //resonsedto로 변경
    const contentResponses = await this.createJourneyContentResponse(contents);

    //journeyResponse 생성
    const journey = journeys[0];

    const response = new JourneyResponse();
    response.id = journey.id;
    response.title = journey.title;
    response.review = journey.review;
    response.creatorNickname = (await journey.creator).nickname;
    response.createdAt = journey.createdAt;
    response.updatedAt = journey.updatedAt;
    response.journeyContents = contentResponses;
    return response;
  }

  async update(
    memberId: number,
    id: number,
    updateJourneyDto: UpdateJourneyRequest,
  ) {
    const journeys = await this.journeyRepository.find({
      where: { id },
      relations: { creator: true },
    });
    if (journeys.length < 1) {
      throw new ResourceNotFoundException();
    }

    const journey = journeys[0];

    const member = await journey.creator;

    this.checkAuthorization(member, memberId);

    const prevContents: { id: number }[] = await this.contentRepository
      .createQueryBuilder('content')
      .select('description.id', 'id')
      .where({ journeyId: id })
      .innerJoin('content.description', 'description')
      .orderBy('content.id')
      .getRawMany();

    const updateOption: { title?: string; review?: string } = {};
    let isUpdate = false;
    if (updateJourneyDto.title !== journey.title) {
      updateOption.title = updateJourneyDto.title;
      isUpdate = true;
    }
    if (updateJourneyDto.review !== journey.review) {
      updateOption.review = updateJourneyDto.review;
      isUpdate = true;
    }

    let isContentUpdate = false;
    if (prevContents.length !== updateJourneyDto.contents.length) {
      isContentUpdate = true;
    }

    if (!isContentUpdate) {
      for (let i = 0; i < prevContents.length; i++) {
        if (prevContents[i].id !== updateJourneyDto.contents[i]) {
          isContentUpdate = true;
          break;
        }
      }
    }

    if (isUpdate || isContentUpdate) {
      const cb = async (em: EntityManager) => {
        if (isUpdate) {
          await em.update(Journey, id, {
            title: updateJourneyDto.title,
            review: updateJourneyDto.review,
          });
        }

        if (isContentUpdate) {
          await em.delete(JourneyContent, { journeyId: id });

          const contents = updateJourneyDto.contents.map((c) => {
            const description = new Description();
            description.id = c;

            const content = new JourneyContent();
            content.journey = Promise.resolve(journey);
            content.description = Promise.resolve(description);
            content.journeyId = journey.id;

            return content;
          });

          await em.save(contents);
        }
      };

      await this.transactionService.transaction(cb);
    }

    return DefaultResponseMessage.SUCCESS;
  }

  async remove(memberId: number, id: number) {
    const journeys = await this.journeyRepository.find({
      where: { id },
      relations: { creator: true },
    });

    if (journeys.length < 1) {
      return DefaultResponseMessage.SUCCESS;
    }
    const journey = journeys[0];

    const member = await journey.creator;

    this.checkAuthorization(member, memberId);

    const cb = async (em: EntityManager) => {
      console.log({ journey: { id: id } });
      await em.delete(JourneyContent, { journeyId: id });

      await em.delete(Journey, id);
    };

    await this.transactionService.transaction(cb);

    return DefaultResponseMessage.SUCCESS;
  }

  //==========================================================================

  private checkAuthorization(member: Member, memberId: number) {
    if (member.id !== memberId) {
      throw new ForbiddenException();
    }

    if (member.role === Role.BANNED) {
      throw new ForbiddenException();
    }
  }

  private async createJourneyContentResponse(contents: JourneyContent[]) {
    const descriptionIds = await Promise.all(
      contents.map(async (c) => (await c.description).id),
    );

    const imageMap = await this.descriptionsService.findImagesByDescriptions(
      descriptionIds,
    );

    const response = await Promise.all(
      contents.map(async (c) => {
        const description = await c.description;
        const descriptionRes = DescriptionResponse.create(
          (await description.creator).nickname,
          description,
          imageMap.get(description.id),
        );
        const destination = await description.destination;
        const destinationRes = DestinationResponse.create(
          (await destination.creator).nickname,
          destination,
        );
        const content = new JourneyContentResponse();
        content.description = descriptionRes;
        content.destination = destinationRes;
        content.journeyId = c.journeyId;

        return content;
      }),
    );
    return response;
  }
}
