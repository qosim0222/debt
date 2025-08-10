import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DebtService } from './debt.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('debt')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Post()
  create(@Body() createDebtDto: CreateDebtDto) {
    return this.debtService.create(createDebtDto);
  }
@UseGuards(AuthGuard)
@Get()
@ApiQuery({ name: 'customerId', required: false, type: String, description: 'Mijoz ID bo‘yicha filtrlash' })
@ApiQuery({ name: 'search', required: false, type: String, description: 'Mijoz fullname bo‘yicha qidirish' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
@ApiQuery({
  name: 'sortBy',
  required: false,
  enum: ['createdAt', 'total_amount', 'monthly_amount'],
  example: 'createdAt',
})
@ApiQuery({
  name: 'sortOrder',
  required: false,
  enum: ['asc', 'desc'],
  example: 'desc',
})
findAll(
  @Query('customerId') customerId?: string,
  @Query('search') search?: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('sortBy') sortBy: string = 'createdAt',
  @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
) {
  return this.debtService.findAll(
    customerId,
    search,
    Number(page),
    Number(limit),
    sortBy,
    sortOrder,
  );
}


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.debtService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDebtDto: UpdateDebtDto) {
    return this.debtService.update(id, updateDebtDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.debtService.remove(id);
  }
}
