import { Pageable } from 'src/common/pageable.dto';
import { JwtMemberDto } from './../auth/dto/jwt-member.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Destination } from 'src/destinations/entities/destination.entity';
import { Between, Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { ResourceNotFoundException } from 'src/exception/resource-not-found.exception';
import { Category } from 'src/destinations/category.enum';
import { BadCategoryException } from './exception/bad-category.exception';
import { Member } from 'src/member/entities/member.entity';
import { Role } from 'src/member/enum/Role';
import { DefaultResponseMessage } from 'src/common/basic-response.enum';
import { DuplicateRoomException } from './exception/duplicate-room.exception';
import { RoomReservation } from './entities/roomReservation.entity';
import { RoomReserveResponse } from './dto/room-reserve-response.dto';
import { RoomResponse } from './dto/room-response.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomReservation)
    private readonly reservationRepository: Repository<RoomReservation>,
  ) {}

  async create(member: JwtMemberDto, createRoomDto: CreateRoomDto) {
    const destinations = await this.destinationRepository.find({
      where: { id: createRoomDto.destinationId },
      relations: { creator: true },
    });

    if (destinations.length < 1) {
      throw new ResourceNotFoundException();
    }

    const destination = destinations[0];
    if (destination.category !== Category.ACCOMMODATION) {
      throw new BadCategoryException();
    }

    const creator = await destination.creator;

    this.checkAuth(creator, member.id);

    const dup = await this.roomRepository.find({
      where: {
        destination: {
          id: createRoomDto.destinationId,
        },
        name: createRoomDto.name,
      },
      take: 1,
    });

    if (dup.length > 0) {
      throw new DuplicateRoomException();
    }

    const room = new Room();
    room.destination = Promise.resolve(destination);
    room.name = createRoomDto.name;
    room.price = createRoomDto.price;
    room.stock = createRoomDto.stock;
    room.inTime = this.convertTime(createRoomDto.inTime);

    await this.roomRepository.save(room);

    return DefaultResponseMessage.SUCCESS;
  }

  async findAll(destiantionId: number, startDate: Date, endDate: Date) {
    const rooms = await this.roomRepository.find({
      where: {
        destination: {
          id: destiantionId,
        },
      },
      relations: {
        destination: true,
      },
      order: {
        id: 'DESC',
      },
    });

    const response = await Promise.all(
      rooms.map(async (r) => {
        let isReservable = true;
        const reservations = await this.reservationRepository.find({
          where: {
            room: { id: r.id },
            reserveDate: Between(startDate, endDate),
          },
        });
        for (const reserve of reservations) {
          if (reserve.isOutOfStock()) {
            isReservable = false;
            break;
          }
        }
        const destination = await r.destination;
        const roomRes = RoomResponse.create(destination, r);
        const response = new RoomReserveResponse();
        response.room = roomRes;
        response.reservationAvailability = isReservable;
        return response;
      }),
    );
    return response;
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }

  checkAuth(creator: Member, memberId: number) {
    if (creator.id !== memberId) {
      throw new ForbiddenException();
    }
    if (creator.role === Role.BANNED) {
      throw new ForbiddenException();
    }
  }

  private convertTime(str: string) {
    const arr = str.split(':');
    const h = parseInt(arr[0]);
    const m = parseInt(arr[1]);
    if (isNaN(h) || isNaN(m)) {
      throw new BadRequestException('can not parse time');
    }

    const date = new Date();
    date.setHours(h, m);

    return date;
  }
}
