import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SampleService } from './sample.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { ApiQuery } from '@nestjs/swagger';

@UseGuards(AuthGuard)
@Controller('samples')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Post()
  create(@Body() dto: CreateSampleDto, @Req() req: any) {
    return this.sampleService.create(dto, req.user.id);
  }

@UseGuards(AuthGuard)
@Get()
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
@ApiQuery({
  name: 'sortOrder',
  required: false,
  enum: ['asc', 'desc'],
  example: 'desc',
})
findAll(
  @Req() req: any,
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
) {
  return this.sampleService.findAll(
    req.user.id,
    Number(page),
    Number(limit),
    sortOrder,
  );
}


  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.sampleService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSampleDto, @Req() req: any) {
    return this.sampleService.update(id, dto, req.user.id);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Req() req: any) {
    return this.sampleService.toggle(id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.sampleService.remove(id, req.user.id);
  }
}
