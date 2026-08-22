import { Controller } from '@nestjs/common';
import { RewardsService } from '../services/rewards.service';

@Controller('users')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}
}
