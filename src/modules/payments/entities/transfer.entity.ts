import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CashbackEntity } from '../../rewards/entities/cashback.entity';

@Entity('transfers')
export class TransferEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CashbackEntity, { nullable: false })
  @JoinColumn({ name: 'cashback' })
  cashback: CashbackEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'recipient_code' })
  recipientCode: string;

  @Column({ name: 'transfer_code', nullable: true })
  transferCode: string;

  @Column({ nullable: true })
  reference: string;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
