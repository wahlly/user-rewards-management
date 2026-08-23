import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CashbackEntity } from '../entities/cashback.entity';
import { PaymentsService } from '../../payments/services/payments.service';

@Injectable()
export class CashbackService {
  private readonly logger = new Logger(CashbackService.name);

  constructor(
    @InjectRepository(CashbackEntity)
    private readonly cashbackRepository: Repository<CashbackEntity>,
    private readonly paymentsService: PaymentsService,
  ) {}

  async processCashback(user: User, badgeName: string, amount: number): Promise<void> {
    try {
      const cashback = await this.cashbackRepository.save({
        user,
        badgeName,
        amount
      });

      await this.paymentsService.initiateTransfer(
        cashback,
        user,
        amount,
        `Cashback for unlocking the ${badgeName} badge`,
      );
    } catch (error: any) {
      this.logger.error(`[CashbackService] processCashback failed for ${user.email}: ${error.message}`, error.stack);
    }
  }
}
