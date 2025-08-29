import { Controller, Post, Body, Get, Req, UseGuards, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto, RefreshTokenDto, ResetPasswordDto } from './dto/login-auth.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginAuthDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

   @UseGuards(AuthGuard)
  @Get('my_data')
  me(@Req() req: any) {
    return this.authService.me_data(req);
  }

  
  @UseGuards(AuthGuard)
  @Patch('/reset-password')
  resetPassword(@Body() newPasswordDto: ResetPasswordDto, @Req() req) {
    const userId = req.user.id;
    return this.authService.resetPassword(userId, newPasswordDto.password);
  }
}

