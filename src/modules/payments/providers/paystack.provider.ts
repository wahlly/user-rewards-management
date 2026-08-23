import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { IPaymentProvider, ITransferResult } from '../interfaces/payment-provider.interface';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class PaystackProvider implements IPaymentProvider {
  // private readonly logger = new Logger(PaystackProvider.name);
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    this.client = axios.create({
      baseURL: this.configService.get<string>('PAYSTACK_BASE_URL'),
      headers: {
        Authorization: `Bearer ${this.configService.get<string>('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async createRecipient(user: User): Promise<string> {
    const response = await this.client.post('/transferrecipient', {
      type: 'nuban',
      name: user.name,
      account_number: user.bankAccountNumber,
      bank_code: user.bankCode,
      currency: 'NGN',
    });
console.log("responselll:::: ", response)
    return response.data.data.recipient_code;
  }

  async initiateTransfer(recipientCode: string, amountNaira: number, reason: string): Promise<ITransferResult> {
    const response = await this.client.post('/transfer', {
      source: 'balance',
      recipient: recipientCode,
      amount: amountNaira * 100,
      reason,
    });
console.log("resisis::: ", response)
    const { transfer_code, reference, status } = response.data.data;
    return { transferCode: transfer_code, reference, status };
  }
}
