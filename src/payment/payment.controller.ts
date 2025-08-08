import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { OneMonthPaymentDto } from './dto/one-month-payment.dto.ts';
import { AnyAmountPaymentDto } from './dto/any-amount-payment.dto';
import { PayByMonthsDto } from './dto/by-months.dto';

@UseGuards(AuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(AuthGuard)
  
  @Post('one-month')
  payOneMonth(@Body() dto: OneMonthPaymentDto, @Request() req) {
    return this.paymentService.payOneMonth(dto, req.user.id);
  }

  @Post('any-amount')
  payAnyAmount(@Body() dto: AnyAmountPaymentDto, @Request() req) {
    return this.paymentService.payAnyAmount(dto, req.user.id);
  }

  @Post('pay-by-months')
  payByMonths(@Body() dto: PayByMonthsDto, @Request() req) {
    return this.paymentService.payByMonths(dto, req.user.id);
  }


  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }
}

