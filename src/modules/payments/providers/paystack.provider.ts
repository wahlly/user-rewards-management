import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import { IPaymentProvider, ITransferResult } from '../interfaces/payment-provider.interface';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class PaystackProvider implements IPaymentProvider {
  private readonly logger = new Logger(PaystackProvider.name);
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
    try {
      const response = await this.client.post('/transferrecipient', {
        type: 'nuban',
        name: user.name,
        account_number: user.bankAccountNumber,
        bank_code: user.bankCode,
        currency: 'NGN',
      });

      return response.data.data.recipient_code;
    } catch (error: any) {
      const message = error.response?.data?.message ?? error.message;
      this.logger.error(`[PaystackProvider] createRecipient failed for user ${user.email}: ${message}`, error.stack);
      throw new Error(`Failed to create Paystack recipient: ${message}`);
    }
  }

  async initiateTransfer(recipientCode: string, amountNaira: number, reason: string): Promise<ITransferResult> {
    try {
      const response = await this.client.post('/transfer', {
        source: 'balance',
        recipient: recipientCode,
        amount: amountNaira * 100,
        reason,
      });

      const { transfer_code, reference, status } = response.data.data;
      return { transferCode: transfer_code, reference, status };
    } catch (error: any) {
      const message = error.response?.data?.message ?? error.message;
      this.logger.error(`[PaystackProvider] initiateTransfer failed for recipient ${recipientCode}: ${message}`, error.stack);
      throw new Error(`Failed to initiate Paystack transfer: ${message}`);
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const hash = crypto
        .createHmac('sha512', this.configService.get<string>('PAYSTACK_SECRET_KEY'))
        .update(payload)
        .digest('hex');

      return hash === signature;
    } catch (error: any) {
      this.logger.error(`[PaystackProvider] verifyWebhookSignature failed: ${error.message}`, error.stack);
      return false;
    }
  }
}
