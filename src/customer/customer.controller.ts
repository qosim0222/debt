import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { ApiQuery } from '@nestjs/swagger';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
    const userId = req.user.id
    return this.customerService.create(createCustomerDto, userId);
  }
@UseGuards(AuthGuard)
@Get()
@ApiQuery({ name: 'search', required: false, type: String })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
@ApiQuery({
  name: 'sortBy',
  required: false,
  enum: ['createdAt', 'fullname'],
  example: 'createdAt',
})
@ApiQuery({
  name: 'sortOrder',
  required: false,
  enum: ['asc', 'desc'],
  example: 'desc',
})
findAll(
  @Query('search') search?: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('sortBy') sortBy: 'createdAt' | 'fullname' = 'createdAt',
  @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
) {
  return this.customerService.findAll(
    search,
    Number(page),
    Number(limit),
    sortBy,
    sortOrder,
  );
}


  
  @Get("total_debt/:id")
  getCustomerDebts(@Param('id') id: string) {
    return this.customerService.getCustomerDebts(id);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
