import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PurchaseEntity } from '../entities/purchase.entity';
import { UsersService } from '../../users/services/users.service';
import { PurchaseCreatedEvent } from '../events/purchase-created.event';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(PurchaseEntity)
    private readonly purchaseRepository: Repository<PurchaseEntity>,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createPurchase(email: string, amount: number): Promise<PurchaseEntity> {
    const user = await this.usersService.findByEmail(email);

    const purchasesCount = await this.purchaseRepository.count({
      where: { user: { id: user.id } },
    });

    const purchase = await this.purchaseRepository.save({ user, amount });

    this.eventEmitter.emit(
      'purchase.created',
      new PurchaseCreatedEvent(user, purchasesCount + 1),
    );

    return purchase;
  }
}
