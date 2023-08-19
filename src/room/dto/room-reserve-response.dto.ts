import { RoomResponse } from './room-response.dto';

export class RoomReserveResponse {
  room: RoomResponse;
  reservationAvailability: boolean;
}
