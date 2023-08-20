import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TravelPay } from './entities/travel-pay.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreditCard } from './entities/credit-card.entity';
import { Member } from 'src/member/entities/member.entity';
import { CreateCreditCardRequest } from './dto/create-credit-card-reqeust.dto';
import { DefaultResponseMessage } from 'src/common/basic-response.enum';
import { Role } from 'src/member/enum/Role';
import { DepositFailedException } from './exception/deposit-failed.exception';
import { ResourceNotFoundException } from 'src/exception/resource-not-found.exception';
import { TravelPayResponse } from './dto/travel-pay-response.dto';
import { CreditCardResponse } from './dto/credit-card-response.dto';
import { PaymentMethodResponse } from './dto/payment-method-response.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(TravelPay)
    private readonly travelPayRepository: Repository<TravelPay>,
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
  ) {}

  async findAll(memberId: number) {
    console.log(memberId);
    const creditCards = await this.creditCardRepository.find({
      where: { member: { id: memberId } },
    });
    console.log(creditCards);

    const travelPays = await this.travelPayRepository.find({
      where: { member: { id: memberId } },
    });
    console.log(travelPays);
    if (travelPays.length < 1) {
      throw new ResourceNotFoundException();
    }
    const travelPay = travelPays[0];

    const travelPayRes = TravelPayResponse.create(travelPay);

    const creditCardRes = creditCards.map((c) => CreditCardResponse.create(c));

    const res = new PaymentMethodResponse();
    res.travelPay = travelPayRes;
    res.creditCards = creditCardRes;

    return res;
  }

  async createCreditCard(
    memberId: number,
    createDto: CreateCreditCardRequest,
    mockBalance: number,
  ) {
    const member = new Member();
    member.id = memberId;

    const creditCard = new CreditCard();
    creditCard.member = Promise.resolve(member);
    creditCard.cardNumber = createDto.cardNumber;
    creditCard.name = createDto.cardName;
    creditCard.owner = createDto.cardOwner;
    creditCard.mockBalance = mockBalance;

    return (await this.creditCardRepository.save(creditCard)).id;
  }

  async deleteCreditCard(memberId: number, cardId: number) {
    const creditCards = await this.creditCardRepository.find({
      where: { id: cardId },
      relations: {
        member: true,
      },
    });

    if (creditCards.length < 1) {
      return DefaultResponseMessage.SUCCESS;
    }

    const creditCard = creditCards[0];
    const member = await creditCard.member;
    this.checkAuth(member, memberId);

    await this.creditCardRepository.remove(creditCard);

    return DefaultResponseMessage.SUCCESS;
  }

  async depositToTravelPay(memberId: number, amount: number) {
    const travelPay = await this.travelPayRepository.findOne({
      where: { member: { id: memberId } },
    });
    if (!travelPay) {
      throw new DepositFailedException();
    }
    const result = await this.travelPayRepository
      .createQueryBuilder('travelPay')
      .update()
      .set({
        balance: () => 'balance + :amount',
      })
      .setParameter('amount', amount)
      .where('id = :id', { id: travelPay.id })
      .execute();
    if (result.affected !== 1) {
      throw new DepositFailedException();
    }

    return DefaultResponseMessage.SUCCESS;
  }

  /**
   * 회원 생성시에 사용
   * @param em 트랜잭션 묶으려면 em 사용해야함
   * @param member 회원
   * @returns 저장한 travelpay
   */
  async createTravelPay(em: EntityManager, member: Member) {
    const travelPay = new TravelPay();
    travelPay.member = Promise.resolve(member);
    travelPay.balance = 0;
    console.log(member, travelPay);
    const saved = await em.save(travelPay);
    return saved;
  }

  //====================================================
  private checkAuth(owner: Member, requestMemberId: number) {
    if (owner.id !== requestMemberId) {
      throw new ForbiddenException();
    }

    if (owner.role === Role.BANNED) {
      throw new ForbiddenException();
    }
  }
}
