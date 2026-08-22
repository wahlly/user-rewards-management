import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from '../users/users.module';
import { PurchasesModule } from '../purchases/purchases.module';
import { RewardsModule } from '../rewards/rewards.module';
import { PaymentsModule } from '../payments/payments.module';
import { dbDataSource } from '../utils/data.source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      cache: true
    }),
    TypeOrmModule.forRoot(dbDataSource),
    UsersModule,
    PurchasesModule,
    RewardsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
