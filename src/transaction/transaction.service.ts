import { DataSource, EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionService {
  constructor(private dataSource: DataSource) {}

  async transaction(cb: (em: EntityManager) => Promise<void>) {
    const qr = this.dataSource.createQueryRunner();
    qr.connect();
    qr.startTransaction();
    try {
      await cb(qr.manager);
      qr.commitTransaction();
    } catch (err) {
      qr.rollbackTransaction();
      throw err;
    } finally {
      qr.release();
    }
  }
}
