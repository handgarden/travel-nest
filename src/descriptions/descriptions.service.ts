import { Pageable } from 'src/common/pageable.dto';
import { UploadFile } from './../file/entities/upload-file.entity';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateDescriptionRequest } from './dto/create-description-request.dto';
import { UpdateDescriptionRequest } from './dto/update-description-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Destination } from 'src/destinations/entities/destination.entity';
import { EntityManager, Repository } from 'typeorm';
import { Description } from './entities/description.entity';
import { DescriptionImage } from './entities/description-image.entity';
import { Member } from 'src/member/entities/member.entity';
import { DescriptionResponse } from './dto/description-response.dto';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';
import { PageResponse } from 'src/common/page-response.dto';
import { ResourceNotFoundException } from 'src/exception/resource-not-found.exception';
import { Role } from 'src/member/enum/Role';
import { TransactionService } from 'src/transaction/transaction.service';
import { FileService } from 'src/file/file.service';
import { DefaultResponseMessage } from 'src/common/basic-response.enum';

@Injectable()
export class DescriptionsService {
  constructor(
    @InjectRepository(Description)
    private descriptionRepository: Repository<Description>,
    @InjectRepository(DescriptionImage)
    private imageRepository: Repository<DescriptionImage>,
    private transactionService: TransactionService,
    private fileService: FileService,
  ) {}

  async create(
    memberDto: JwtMemberDto,
    createDescriptionDto: CreateDescriptionRequest,
  ) {
    const destination = new Destination();
    destination.id = createDescriptionDto.destinationId;

    const member = new Member();
    member.id = memberDto.id;

    const description = new Description();
    description.destination = Promise.resolve(destination);
    description.creator = Promise.resolve(member);
    description.content = createDescriptionDto.content;

    const cb = async (em: EntityManager) => {
      const pDescription = await em.save(description);

      const descriptionImages = this.createDescriptionImage(
        createDescriptionDto.storeFileNames,
        pDescription,
        destination,
      );

      await em.save(descriptionImages);

      const response = await this.convertToResponse(
        pDescription,
        createDescriptionDto.storeFileNames,
        memberDto,
      );

      return response;
    };

    return this.transactionService.transaction(cb);
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

  async update(
    memberId: number,
    id: number,
    updateDescriptionDto: UpdateDescriptionRequest,
  ) {
    const result = await this.descriptionRepository.find({
      where: { id },
      relations: { creator: true, destination: true },
    });

    if (result.length < 1) {
      throw new ResourceNotFoundException();
    }

    const description = result[0];

    const creator = await description.creator;

    this.authorize(creator, memberId);

    const prevImages = await this.imageRepository.find({
      where: { description: { id: id } },
      relations: { uploadFile: true },
    });

    const destination = new Destination();
    destination.id = id;

    const newImages = this.createDescriptionImage(
      updateDescriptionDto.storeFileNames,
      description,
      destination,
    );

    const removeImages = (
      await Promise.all(
        prevImages.map(async (i) => {
          const storeFileName = (await i.uploadFile).storeFileName;
          if (!updateDescriptionDto.storeFileNames.includes(storeFileName)) {
            return i;
          }
        }),
      )
    ).filter(Boolean);

    const cb = async (em: EntityManager) => {
      await em.update(Description, id, {
        content: updateDescriptionDto.content,
      });
      description.content = updateDescriptionDto.content;

      await em.remove(removeImages);

      await em.upsert(DescriptionImage, newImages, [
        'uploadFile.storeFileName',
      ]);
    };

    await this.transactionService.transaction(cb);

    removeImages.forEach(async (i) =>
      this.fileService.remove(memberId, (await i.uploadFile).storeFileName),
    );

    return this.convertToResponse(
      description,
      updateDescriptionDto.storeFileNames,
    );
  }

  async remove(memberId: number, id: number) {
    const descriptions = await this.descriptionRepository.find({
      where: { id },
      relations: {
        creator: true,
      },
    });

    if (descriptions.length < 1) {
      return DefaultResponseMessage.SUCCESS;
    }
    const description = descriptions[0];

    this.authorize(await description.creator, memberId);

    const images = await this.imageRepository.find({
      where: { description: { id } },
      relations: {
        uploadFile: true,
      },
    });

    const storeFileNames = await Promise.all(
      images.map(async (i) => (await i.uploadFile).storeFileName),
    );

    const cb = async (em: EntityManager) => {
      await em.remove(images);
      await em.remove(description);
    };

    await this.transactionService.transaction(cb);

    storeFileNames.forEach((s) => this.fileService.remove(memberId, s));

    return DefaultResponseMessage.SUCCESS;
  }

  private createDescriptionImage(
    storeFileNames: string[],
    description: Description,
    destination: Destination,
  ) {
    return storeFileNames.map((s) => {
      const image = new DescriptionImage();
      image.description = Promise.resolve(description);
      image.destination = Promise.resolve(destination);
      const uploadFile = new UploadFile();
      uploadFile.storeFileName = s;
      image.uploadFile = Promise.resolve(uploadFile);
      return image;
    });
  }

  private authorize(creator: Member, memberId: number) {
    if (creator.id !== memberId) {
      throw new ForbiddenException();
    }

    if (creator.role === Role.BANNED) {
      throw new ForbiddenException();
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
}
