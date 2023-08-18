import { Pageable } from 'src/common/pageable.dto';
import { UploadFile } from './../file/entities/upload-file.entity';
import { Injectable } from '@nestjs/common';
import { CreateDescriptionRequest } from './dto/create-description.dto';
import { UpdateDescriptionDto } from './dto/update-description.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Destination } from 'src/destinations/entities/destination.entity';
import { DataSource, Repository } from 'typeorm';
import { Description } from './entities/description.entity';
import { DescriptionImage } from './entities/description-image.entity';
import { Member } from 'src/member/entities/member.entity';
import { DescriptionResponse } from './dto/description-response.dto';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { PageResponse } from 'src/common/page-response.dto';

@Injectable()
export class DescriptionsService {
  constructor(
    // @InjectRepository(Destination)
    // private destinationRepository: Repository<Destination>,
    @InjectRepository(Description)
    private descriptionRepository: Repository<Description>,
    @InjectRepository(DescriptionImage)
    private imageRepository: Repository<DescriptionImage>,
    // @InjectRepository(Member)
    // private memberRepository: Repository<Member>,
    private dataSource: DataSource,
  ) {}

  async create(
    memberDto: JwtMemberDto,
    createDescriptionDto: CreateDescriptionRequest,
  ) {
    const destination = new Destination();
    destination.id = createDescriptionDto.destinationId;

    const member = new Member();
    member.id = memberDto.id;

    const qr = this.dataSource.createQueryRunner();

    const description = new Description();
    description.destination = Promise.resolve(destination);
    description.creator = Promise.resolve(member);
    description.content = createDescriptionDto.content;

    qr.startTransaction();
    qr.connect();

    try {
      const pDescription = await qr.manager.save(description);

      const descriptionImages = this.createDescriptionImage(
        createDescriptionDto.storeFileNames,
        pDescription,
        destination,
      );

      await qr.manager.save(descriptionImages);
      qr.commitTransaction();

      const response = await this.convertToResponse(
        pDescription,
        createDescriptionDto.storeFileNames,
        memberDto,
      );

      return response;
    } catch (err) {
      qr.rollbackTransaction();
    } finally {
      qr.release();
    }
  }

  private async convertToResponse(
    pDescription: Description,
    images: string[],
    memberDto?: JwtMemberDto,
  ) {
    const response = new DescriptionResponse();
    response.id = pDescription.id;
    response.content = pDescription.content;
    response.createdAt = pDescription.createdAt;
    response.updatedAt = pDescription.updatedAt;
    response.images = images;
    if (memberDto) {
      response.creatorNickname = memberDto.nickname;
    } else {
      response.creatorNickname = (await pDescription.creator).nickname;
    }
    return response;
  }

  async findAll(destinationId: number, pageable: Pageable) {
    const result = await this.descriptionRepository.findAndCount({
      where: {
        destination: {
          id: destinationId,
        },
      },
      relations: {
        creator: true,
      },
      order: {
        id: 'DESC',
      },
      take: pageable.size,
      skip: pageable.size * pageable.page,
    });

    const descriptions = result[0];
    const total = result[1];

    const ids = descriptions.map((d) => d.id);

    const images: { storeFileName: string; descriptionId: number }[] =
      await this.imageRepository
        .createQueryBuilder('image')
        .innerJoin('image.description', 'description')
        .innerJoin('image.uploadFile', 'uploadFile')
        .select('uploadFile.storeFileName', 'storeFileName')
        .addSelect('description.id', 'descriptionId')
        .where('description.id IN (:...ids)', { ids })
        .orderBy('image.id', 'ASC')
        .getRawMany();

    const imageMap = new Map<number, string[]>();
    ids.forEach((i) => imageMap.set(i, []));

    images.forEach((i) => {
      imageMap.get(i.descriptionId).push(i.storeFileName);
    });

    const responses = await Promise.all(
      descriptions.map(
        async (d) => await this.convertToResponse(d, imageMap.get(d.id)),
      ),
    );

    return new PageResponse(responses, total);
  }

  findOne(id: number) {
    return `This action returns a #${id} description`;
  }

  update(id: number, updateDescriptionDto: UpdateDescriptionDto) {
    return `This action updates a #${id} description`;
  }

  remove(id: number) {
    return `This action removes a #${id} description`;
  }

  private createDescriptionImage(
    storeFileNames: string[],
    description: Description,
    destination: Destination,
  ) {
    return storeFileNames.map((i) => {
      const image = new DescriptionImage();
      image.description = Promise.resolve(description);
      image.destination = Promise.resolve(destination);
      const uploadFile = new UploadFile();
      uploadFile.storeFileName = i;
      image.uploadFile = Promise.resolve(uploadFile);
      return image;
    });
  }
}
