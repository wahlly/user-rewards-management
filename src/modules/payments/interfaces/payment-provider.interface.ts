import { User } from '../../users/entities/user.entity';

export interface ITransferResult {
  transferCode: string;
  reference: string;
  status: string;
}

export interface IPaymentProvider {
  createRecipient(user: User): Promise<string>;
  initiateTransfer(recipientCode: string, amountNaira: number, reason: string): Promise<ITransferResult>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';
