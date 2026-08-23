import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './services/payments.service';
import { PaystackProvider } from './providers/paystack.provider';
import { TransferEntity } from './entities/transfer.entity';
import { PAYMENT_PROVIDER } from './interfaces/payment-provider.interface';

@Module({
  imports: [TypeOrmModule.forFeature([TransferEntity])],
  providers: [
    PaymentsService,
    {
      provide: PAYMENT_PROVIDER,
      useClass: PaystackProvider,
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
