import { Destination } from 'src/destinations/entities/destination.entity';
import { Room } from '../entities/room.entity';

export class RoomResponse {
  id: number;
  destinationId: number;
  destinationName: string;
  name: string;
  price: number;
  inTime: string;

  static create(destination: Destination, room: Room) {
    const res = new RoomResponse();
    res.id = room.id;
    res.destinationId = destination.id;
    res.destinationName = destination.title;
    res.name = room.name;
    res.price = room.price;
    const h = room.inTime.getHours();
    const m = room.inTime.getMinutes();
    const time = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
    res.inTime = time;
    return res;
  }
}
