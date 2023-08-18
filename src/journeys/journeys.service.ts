import { DescriptionsService } from './../descriptions/descriptions.service';
import { Injectable } from '@nestjs/common';
import { CreateJourneyDto } from './dto/create-journey.dto';
import { UpdateJourneyDto } from './dto/update-journey.dto';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Description } from 'src/descriptions/entities/description.entity';
import { Repository } from 'typeorm';
import { Pageable } from 'src/common/pageable.dto';
import { PageResponse } from 'src/common/page-response.dto';
import { JourneyContentResponse } from './dto/journey-content-response.dto';
import { DescriptionResponse } from 'src/descriptions/dto/description-response.dto';
import { DestinationResponse } from 'src/destinations/dto/destination-response.dto';

@Injectable()
export class JourneysService {
  constructor(
    @InjectRepository(Description)
    private descriptionRepository: Repository<Description>,
    private descriptionsService: DescriptionsService,
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

  create(createJourneyDto: CreateJourneyDto) {
    return 'This action adds a new journey';
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
