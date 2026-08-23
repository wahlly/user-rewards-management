import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CashbackService } from '../services/cashback.service';
import { BadgeUnlockedEvent } from '../events/badge-unlocked.event';

@Injectable()
export class BadgeUnlockedListener {
  private readonly logger = new Logger(BadgeUnlockedListener.name);

  constructor(private readonly cashbackService: CashbackService) {}

  @OnEvent('badge.unlocked')
  async handleBadgeUnlocked(event: BadgeUnlockedEvent): Promise<void> {
    this.logger.log(`[BadgeUnlockedListener] Badge "${event.badgeName}" unlocked for ${event.user.email} — initiating cashback`);
    await this.cashbackService.processCashback(event.user, event.badgeName, 300);
  }
}
