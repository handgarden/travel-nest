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

@Injectable()
export class DescriptionsService {
  constructor(
    // @InjectRepository(Destination)
    // private destinationRepository: Repository<Destination>,
    @InjectRepository(Description)
    private descriptionRepository: Repository<Description>,
    // @InjectRepository(DescriptionImage)
    // private imageRepository: Repository<DescriptionImage>,
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

      const response = new DescriptionResponse();
      response.id = pDescription.id;
      response.content = pDescription.content;
      response.createdAt = pDescription.createdAt;
      response.updatedAt = pDescription.updatedAt;
      response.creatorNickname = memberDto.nickname;
      response.images = createDescriptionDto.storeFileNames;

      return response;
    } catch (err) {
      qr.rollbackTransaction();
    } finally {
      qr.release();
    }
  }

  findAll() {
    return `This action returns all descriptions`;
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
