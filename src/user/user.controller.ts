import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import {  ResetPasswordDto } from 'src/auth/dto/login-auth.dto';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/guards/role.decorator';
import { userRole } from '@prisma/client';

@Controller('user')
export class UserController {
  authService: any;
  constructor(private readonly userService: UserService) {}

  // @Roles(userRole.ADMIN)
  // @UseGuards(AuthGuard, RolesGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }



@UseGuards(AuthGuard)
@Get()
@ApiQuery({ name: 'page', required: false, example: 1 })
@ApiQuery({ name: 'limit', required: false, example: 10 })
@ApiQuery({name: 'search',required: false,description: " fullname yoki telefoni bo'yicha qidirish",})
findAll(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('search') search?: string,
) {
  return this.userService.findAll(
    Number(page) || 1,
    Number(limit) || 10,
    search
  );
}

@UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  
  @Roles(userRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }


  }



