import { TravelPay } from '../entities/travel-pay.entity';

export class TravelPayResponse {
  id: number;
  balance: number;

  static create(travelPay: TravelPay) {
    const res = new TravelPayResponse();
    res.id = travelPay.id;
    res.balance = travelPay.balance;
    return res;
  }
}
