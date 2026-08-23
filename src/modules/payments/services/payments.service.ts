import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TransferEntity } from '../entities/transfer.entity';
import { CashbackEntity } from '../../rewards/entities/cashback.entity';
import { IPaymentProvider, PAYMENT_PROVIDER } from '../interfaces/payment-provider.interface';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(TransferEntity)
    private readonly transferRepository: Repository<TransferEntity>,
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async initiateTransfer(cashback: CashbackEntity, user: User, amount: number, reason: string): Promise<void> {
    let transfer: TransferEntity | null = null;

    try {
      const recipientCode = await this.paymentProvider.createRecipient(user);

      transfer = await this.transferRepository.save({
        cashback,
        recipientCode
      });

      //my paystack account can't initiate transfers yet, so this fails...
      const result = await this.paymentProvider.initiateTransfer(recipientCode, amount, reason);

      await this.transferRepository.update(transfer.id, {
        transferCode: result.transferCode,
        reference: result.reference,
        status: result.status ?? "pending",
      });

      this.logger.log(`[PaymentsService] Transfer of ₦${amount} initiated for ${user.email} — status: ${result.status}`);
    } catch (error: any) {
      this.logger.error(`[PaymentsService] initiateTransfer failed for ${user.email}: ${error.message}`, error.stack);
      this.logger.error(`provider error response: ${JSON.stringify(error.response?.data)}`);

      if (transfer) {
        await this.transferRepository.update(transfer.id, { status: 'failed' }).catch(() => null);
      }
    }
  }
}
