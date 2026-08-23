import { User } from '../../users/entities/user.entity';

export class PurchaseCreatedEvent {
  constructor(
    public readonly user: User,
    public readonly totalPurchaseCount: number,
  ) {}
}
