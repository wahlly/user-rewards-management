import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentsService } from '../../payments/services/payments.service';
import { BadgeUnlockedEvent } from '../events/badge-unlocked.event';

@Injectable()
export class BadgeUnlockedListener {
  constructor(private readonly paymentsService: PaymentsService) {}

  @OnEvent('badge.unlocked')
  async handleBadgeUnlocked(event: BadgeUnlockedEvent): Promise<void> {
    // await this.paymentsService.sendCashback(event.user, 300);
  }
}
