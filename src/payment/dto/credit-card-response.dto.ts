import { CreditCard } from '../entities/credit-card.entity';

export class CreditCardResponse {
  id: number;
  cardName: string;
  ownerName: string;
  cardNumber: string;

  static create(creditCard: CreditCard) {
    const response = new CreditCardResponse();
    response.id = creditCard.id;
    response.cardName = creditCard.name;
    response.ownerName = creditCard.owner;
    const cardNumber = creditCard.cardNumber;
    const subNumber = cardNumber.substring(0, cardNumber.length - 4);
    response.cardNumber = subNumber + 'xxxx';
    return response;
  }
}
