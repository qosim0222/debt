import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { ApiQuery } from '@nestjs/swagger';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

@UseGuards(AuthGuard)
@Get()
@ApiQuery({ name: 'customerId', required: false, type: String, description: 'Mijoz ID bo‘yicha filtrlash' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
@ApiQuery({
  name: 'sortOrder',
  required: false,
  enum: ['asc', 'desc'],
  example: 'desc',
})
findAll(
  @Query('customerId') customerId?: string,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
) {
  return this.messageService.findAll(
    customerId,
    Number(page),
    Number(limit),
    sortOrder,
  );
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }
}
