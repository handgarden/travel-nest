import { OrderStatus } from '../entities/order-status.enum';
import { RoomOrder } from '../entities/room-order.entity';
import * as moment from 'moment';
import { DateFormat } from 'src/common/date-format';

export class RoomOrderResponse {
  id: number;
  accommodationId: number;
  accommodationName: string;
  roomId: number;
  roomName: string;
  roomPrice: number;
  inTime: string;
  totalPrice: number;
  startDate: string;
  endDate: string;
  consumerNickname: string;
  status: OrderStatus;
  createAt: Date;
  updatedAt: Date;

  static async create(order: RoomOrder, memberNickname: string) {
    const res = new RoomOrderResponse();
    res.id = order.id;
    res.status = order.status;
    const room = await order.room;
    res.roomId = room.id;
    res.roomName = room.name;
    res.roomPrice = room.price;
    res.inTime = moment(room.inTime).format(DateFormat.TIME);
    const destination = await room.destination;
    res.accommodationId = destination.id;
    res.accommodationName = destination.title;
    res.consumerNickname = memberNickname;
    res.createAt = order.createdAt;
    res.updatedAt = order.updatedAt;
    res.totalPrice = order.totalPrice;
    res.startDate = moment(order.startDate).format(DateFormat.DATE);
    res.endDate = moment(order.endDate).format(DateFormat.DATE);
    return res;
  }
}
