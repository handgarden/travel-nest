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
import { Between, EntityManager, Repository } from 'typeorm';
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
import { CompleteOrderException } from './exception/complete-order.exception';
import { CancellationTimeoutException } from './exception/cancellation-timeout.exception';
import { OrderCancellationException } from './exception/order-cancellation.exception';

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

  async saveRoom(member: JwtMemberDto, createRoomDto: CreateRoomDto) {
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

  async getRoomsForReserve(
    destiantionId: number,
    startDate: Date,
    endDate: Date,
  ) {
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

  async getRoom(id: number) {
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

  async getRoomsByProducer(producerId: number, pageable: Pageable) {
    const [rooms, total] = await this.roomRepository.findAndCount({
      where: {
        destination: {
          creator: {
            id: producerId,
          },
        },
      },
      relations: { destination: true },
      order: { id: 'DESC' },
      take: pageable.getTake(),
      skip: pageable.getSkip(),
    });

    const responses = await Promise.all(
      rooms.map(async (r) => {
        const destination = await r.destination;
        return RoomResponse.create(destination, r);
      }),
    );

    return new PageResponse(responses, total);
  }

  async reserveRoom(reserveDto: ReserveRoomDto) {
    const startM = moment(reserveDto.startDate);
    const endM = moment(reserveDto.endDate);
    const diff = endM.diff(startM, 'days');

    const room = await this.roomRepository.findOne({
      where: { id: reserveDto.roomId },
      relations: { destination: { creator: true } },
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
      order.producer = (await room.destination).creator;
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
      const response = await RoomOrderResponse.createAsync(
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
        return await RoomOrderResponse.createAsync(o, member.nickname);
      }),
    );
    return new PageResponse(res, total);
  }

  async confirmOrder(memberId: number, orderId: number) {
    const orders = await this.orderRepository.find({
      where: { id: orderId },
      relations: { consumer: true, producer: true },
      take: 1,
    });

    if (orders.length < 1) {
      throw new ResourceNotFoundException();
    }

    const order = orders[0];

    await this.hasOrderOwnership(memberId, order);

    if (order.status !== OrderStatus.CREATED) {
      throw new CompleteOrderException();
    }

    await this.orderRepository.update(
      { id: orderId },
      { status: OrderStatus.CONFIRMED },
    );

    return DefaultResponseMessage.SUCCESS;
  }

  async cancleOrder(memberId: number, orderId: number) {
    const orders = await this.orderRepository.find({
      where: { id: orderId },
      relations: {
        consumer: true,
        producer: true,
        room: true,
        creditCard: true,
        travelPay: true,
      },
      take: 1,
    });

    if (orders.length < 1) {
      throw new ResourceNotFoundException();
    }

    const order = orders[0];

    await this.hasOrderOwnership(memberId, order);

    if (order.status !== OrderStatus.CREATED) {
      throw new CompleteOrderException();
    }

    const room = await order.room;

    const orderLimitTime = moment(order.createdAt).add(10, 'minutes');
    const now = moment();
    if (now.isAfter(orderLimitTime)) {
      const inTimeDate = moment(room.inTime);
      const baseDate = moment(order.startDate);
      baseDate.set('hour', inTimeDate.hours());
      baseDate.set('minute', inTimeDate.minutes());
      const limitDate = baseDate.add(-30, 'minutes');
      if (now.isAfter(limitDate)) {
        throw new CancellationTimeoutException();
      }
    }

    const consumer = await order.consumer;
    const request = new ProcessPaymentRequest();
    request.memberId = consumer.id;
    request.paymentType = order.paymentType;
    if (order.paymentType === PaymentType.CREDIT_CARD) {
      request.paymentId = (await order.creditCard).id;
      request.price = order.totalPrice;
    } else {
      request.paymentId = (await order.travelPay).id;
      request.price = order.totalPrice;
    }

    const restoreStockTx = async (em: EntityManager) => {
      const startM = moment(order.startDate);
      const endM = moment(order.endDate);
      const diff = endM.diff(startM, 'days');

      const result = await em
        .getRepository(RoomReservation)
        .createQueryBuilder('reserve')
        .update()
        .set({ stock: () => 'stock + 1' })
        .where('roomId = :roomId', { roomId: room.id })
        .andWhere('reserveDate BETWEEN :start AND :end', {
          start: startM.toDate(),
          end: endM.add(-1, 'days').toDate(),
        })
        .execute();
      if (result.affected !== diff) {
        throw new OrderCancellationException();
      }
    };

    const cb = async (em: EntityManager) => {
      await em
        .getRepository(RoomOrder)
        .update({ id: orderId }, { status: OrderStatus.CANCELLED });
      await this.paymentService.cancelPayment(em, request);
      await restoreStockTx(em);
    };

    await this.transactionService.transaction(cb);

    return DefaultResponseMessage.SUCCESS;
  }

  async getRoomOrdersByProducer(
    member: JwtMemberDto,
    roomId: number,
    pageable: Pageable,
  ) {
    const rooms = await this.roomRepository.find({
      where: { id: roomId, destination: { creator: { id: member.id } } },
      relations: {
        destination: true,
      },
      take: 1,
    });

    //숙소의 주인이 아님
    if (rooms.length < 1) {
      throw new ForbiddenException();
    }
    const room = rooms[0];
    const destination = await room.destination;

    const [orders, total] = await this.orderRepository.findAndCount({
      where: {
        room: {
          id: roomId,
        },
      },
      relations: {
        consumer: true,
      },
      order: { id: 'DESC' },
      take: pageable.getTake(),
      skip: pageable.getSkip(),
    });

    const res = await Promise.all(
      orders.map(async (o) => {
        const consumer = await o.consumer;
        return RoomOrderResponse.create(
          o,
          room,
          destination,
          consumer.nickname,
        );
      }),
    );

    return new PageResponse(res, total);
  }

  //=======================================================

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
          reserve.room_id = room.id;
          reserve.stock = room.stock;
          reserve.reserveDate = d;
          await this.reservationRepository.save(reserve);
        } catch (err) {
          this.logger.log('create reserve crash', err);
        }
      }),
    );
  }

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

  private async hasOrderOwnership(memberId: number, order: RoomOrder) {
    const consumer = await order.consumer;
    const producer = await order.producer;

    if (consumer.id !== memberId && producer.id !== memberId) {
      throw new ForbiddenException();
    }
  }
}
