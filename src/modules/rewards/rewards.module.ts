import { Module } from '@nestjs/common';
import { RewardsService } from './services/rewards.service';
import { RewardsController } from './controllers/rewards.controller';

@Module({
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
