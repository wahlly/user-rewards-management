import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AchievementsService } from '../services/achievements.service';
import { PurchaseCreatedEvent } from '../../purchases/events/purchase-created.event';
import { AchievementUnlockedEvent } from '../events/achievement-unlocked.event';

@Injectable()
export class AchievementsListener {
  constructor(
    private readonly achievementsService: AchievementsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('purchase.created')
  async handlePurchaseCreatedEvent(event: PurchaseCreatedEvent): Promise<void> {
    try {
      const newlyUnlockedAchievements = await this.achievementsService.evaluateAchievements(
        event.user,
        event.totalPurchaseCount,
      );

      //TRIGGER 'achievement.unlocked' event if any newly unlocked achievement is found.
      for (const achievement of newlyUnlockedAchievements) {
        this.eventEmitter.emit(
          'achievement.unlocked',
          new AchievementUnlockedEvent(achievement, event.user),
        );
      }
    }
    catch (error) {
      console.log("Error handling event->purchase.created: ", error)
    }
  }
}
