import { DataSource, EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionService {
  constructor(private dataSource: DataSource) {}

  async transaction<T>(cb: (em: EntityManager) => Promise<T>) {
    const qr = this.dataSource.createQueryRunner();
    qr.connect();
    qr.startTransaction();
    try {
      const result = await cb(qr.manager);
      qr.commitTransaction();
      return result;
    } catch (err) {
      qr.rollbackTransaction();
      throw err;
    } finally {
      qr.release();
    }
  }
}
