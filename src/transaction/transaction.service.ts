import { DataSource, EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionService {
  constructor(private dataSource: DataSource) {}

  async transaction<T>(cb: (em: EntityManager) => Promise<T>) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const result = await cb(qr.manager);
      await qr.commitTransaction();
      return result;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }
}
