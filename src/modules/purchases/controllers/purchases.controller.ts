import { Controller } from '@nestjs/common';
import { PurchasesService } from '../services/purchases.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}
}
