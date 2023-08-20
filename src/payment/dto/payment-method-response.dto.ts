import { CreditCardResponse } from './credit-card-response.dto';
import { TravelPayResponse } from './travel-pay-response.dto';

export class PaymentMethodResponse {
  travelPay: TravelPayResponse;
  creditCards: CreditCardResponse[];
}
