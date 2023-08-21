import { JwtMemberDto } from './../auth/dto/jwt-member.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Destination } from 'src/destinations/entities/destination.entity';
import { Between, EntityManager, In, Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { ResourceNotFoundException } from 'src/exception/resource-not-found.exception';
import { Category } from 'src/destinations/category.enum';
import { BadCategoryException } from './exception/bad-category.exception';
import { Member } from 'src/member/entities/member.entity';
import { Role } from 'src/member/enum/Role';
import { DefaultResponseMessage } from 'src/common/basic-response.enum';
import { DuplicateRoomException } from './exception/duplicate-room.exception';
import { RoomReservation } from './entities/room-reservation.entity';
import { RoomReserveResponse } from './dto/room-reserve-response.dto';
import { RoomResponse } from './dto/room-response.dto';
import { ReserveRoomDto } from './dto/reserve-room.dto';
import * as moment from 'moment';
import { OutOfStockException } from './exception/out-of-stock.exception';
import { PaymentService } from 'src/payment/payment.service';
import { ProcessPaymentRequest } from 'src/payment/dto/process-payment-request.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { OrderStatus } from './entities/order-status.enum';
import { PaymentType } from 'src/payment/entities/payment-type.enum';
import { CreditCard } from 'src/payment/entities/credit-card.entity';
import { TravelPay } from 'src/payment/entities/travel-pay.entity';
import { RoomOrderResponse } from './dto/room-order-response.dto';
import { RoomOrder } from './entities/room-order.entity';
import { Pageable } from 'src/common/pageable.dto';
import { PageResponse } from 'src/common/page-response.dto';

@Injectable()
export class RoomService {
  private readonly logger = new Logger('RoomService');
  constructor(
    @InjectRepository(Destination)
    private readonly destinationRepository: Repository<Destination>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomReservation)
    private readonly reservationRepository: Repository<RoomReservation>,
    private readonly paymentService: PaymentService,
    private readonly transactionService: TransactionService,
    @InjectRepository(RoomOrder)
    private readonly orderRepository: Repository<RoomOrder>,
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

  async findOne(id: number) {
    const rooms = await this.roomRepository.find({
      where: {
        id,
      },
      relations: {
        destination: true,
      },
      take: 1,
    });

    if (rooms.length < 1) {
      throw new NotFoundException();
    }

    const room = rooms[0];
    const destination = await room.destination;

    return RoomResponse.create(destination, room);
  }

  async reserveRoom(reserveDto: ReserveRoomDto) {
    const startM = moment(reserveDto.startDate);
    const endM = moment(reserveDto.endDate);
    const diff = endM.diff(startM, 'days');

    const room = await this.roomRepository.findOne({
      where: { id: reserveDto.roomId },
      relations: { destination: true },
    });

    const totalPrice = room.price * diff;

    const reserveTx = async (em: EntityManager) => {
      const result = await em
        .getRepository(RoomReservation)
        .createQueryBuilder('reserve')
        .update()
        .set({ stock: () => 'stock - 1' })
        .where('roomId = :roomId', { roomId: reserveDto.roomId })
        .andWhere('reserveDate BETWEEN :start AND :end', {
          start: startM.toDate(),
          end: endM.clone().add(-1, 'days').toDate(),
        })
        .andWhere('stock > 0')
        .execute();
      if (result.affected !== diff) {
        throw new OutOfStockException();
      }
    };

    const saveOrder = async (em: EntityManager) => {
      const order = new RoomOrder();
      const member = new Member();
      member.id = reserveDto.requestMemberId;
      order.consumer = Promise.resolve(member);
      order.room = Promise.resolve(room);
      order.startDate = startM.toDate();
      order.endDate = endM.toDate();
      order.status = OrderStatus.CREATED;
      order.paymentType = reserveDto.paymentMethod.paymentType;
      if (order.paymentType === PaymentType.CREDIT_CARD) {
        const card = new CreditCard();
        card.id = reserveDto.paymentMethod.paymentMethodId;
        order.creditCard = Promise.resolve(card);
      } else {
        const pay = new TravelPay();
        pay.id = reserveDto.paymentMethod.paymentMethodId;
        order.travelPay = Promise.resolve(pay);
      }
      order.totalPrice = totalPrice;
      const saved = await em.save(order);
      const response = await RoomOrderResponse.create(
        saved,
        reserveDto.requestMemberNickname,
      );
      return response;
    };

    const request = new ProcessPaymentRequest();
    request.memberId = reserveDto.requestMemberId;
    request.paymentType = reserveDto.paymentMethod.paymentType;
    request.paymentId = reserveDto.paymentMethod.paymentMethodId;
    request.price = totalPrice;
    const cb = async (em: EntityManager) => {
      await this.paymentService.proccessPayment(em, request);
      await reserveTx(em);
      const res = await saveOrder(em);
      return res;
    };

    return await this.transactionService.transaction(cb);
  }

  async getOrders(member: JwtMemberDto, pageable: Pageable) {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { consumer: { id: member.id } },
      relations: {
        room: {
          destination: true,
        },
      },
      order: { id: 'DESC' },
      take: pageable.getTake(),
      skip: pageable.getSkip(),
    });

    const res = await Promise.all(
      orders.map(async (o) => {
        return await RoomOrderResponse.create(o, member.nickname);
      }),
    );
    return new PageResponse(res, total);
  }

  async createRoomReservation(
    roomId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const startM = moment(startDate);
    const endM = moment(endDate);

    const diff = endM.diff(startM, 'days');

    const dateMap = new Map<string, Date>();

    for (let i = 0; i < diff; i++) {
      const date = startM.clone().add(i, 'days').toDate();
      dateMap.set(date.toString(), date);
    }

    const room = await this.roomRepository.findOneBy({ id: roomId });

    if (!room) {
      throw new ResourceNotFoundException();
    }

    const exist = await this.reservationRepository.find({
      where: {
        room: { id: roomId },
        reserveDate: Between(startDate, endM.clone().add(-1, 'days').toDate()),
      },
    });

    exist.forEach((e) => dateMap.delete(e.reserveDate.toString()));

    const dateArr = [];
    dateMap.forEach((d) => dateArr.push(d));

    await Promise.all(
      dateArr.map(async (d) => {
        try {
          const reserve = new RoomReservation();
          reserve.room = Promise.resolve(room);
          reserve.roomId = room.id;
          reserve.stock = room.stock;
          reserve.reserveDate = d;
          await this.reservationRepository.save(reserve);
        } catch (err) {
          this.logger.log('create reserve crash', err);
        }
      }),
    );
  }

  //=======================================================

  private checkAuth(creator: Member, memberId: number) {
    if (creator.id !== memberId) {
      throw new ForbiddenException();
    }
    if (creator.role === Role.BANNED) {
      throw new ForbiddenException();
    }
  }

  private convertTime(str: string) {
    const m = moment(str, 'HH:mm');
    if (!m.isValid()) {
      throw new BadRequestException('can not parse time');
    }

    return m.toDate();
  }
}
