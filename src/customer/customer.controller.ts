import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
    const userId = req.user.id
    return this.customerService.create(createCustomerDto, userId);
  }

  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  
  @Get("debt/:id")
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
