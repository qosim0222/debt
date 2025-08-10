import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { OneMonthPaymentDto } from './dto/one-month-payment.dto.ts';
import { AnyAmountPaymentDto } from './dto/any-amount-payment.dto';
import { PayByMonthsDto } from './dto/by-months.dto';
import { ApiQuery } from '@nestjs/swagger';

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

@UseGuards(AuthGuard)
@Get()
@ApiQuery({ name: 'debtId', required: false, type: String, description: 'Qarz ID bo‘yicha filtrlash' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
@ApiQuery({
  name: 'sortOrder',
  required: false,
  enum: ['asc', 'desc'],
  example: 'desc',
})
findAll(
  @Query('debtId') debtId?: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
) {
  return this.paymentService.findAll(
    debtId,
    Number(page),
    Number(limit),
    sortOrder,
  );
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

