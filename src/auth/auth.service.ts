import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginAuthDto } from './dto/login-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private ACCKEY = process.env.ACCKEY || 'access_key';
  private REFKEY = process.env.REFKEY || 'refresh_key';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginAuthDto) {
    const { userName, password } = loginDto;

    try {
      const user = await this.prisma.user.findUnique({ where: { userName } });
     ;
      if (!user ||!( await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException("username yoki parol noto'g'ri");
      }

      const payload = { id: user.id, role: user.role };
      const accessToken = this.genAccessToken(payload);
      const refreshToken = this.genRefreshToken(payload); 

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message || 'Serverda xatolik');
    }
  }



  async me_data(req: Request) {
    const user = req['user'];
    try {
      
      const data = await this.prisma.user.findUnique({
        where: { id: user.id },
        omit: { password: true },
      });

      return { data };
    } catch (error) {
      throw new BadRequestException(error?.message);
    }
  }
  
  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.REFKEY,
      });
      const accessToken = this.genAccessToken({ id: decoded.id, role: decoded.role });
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException("Refresh token noto'g'ri yoki muddati tugagan");
    }
  }

  
  async resetPassword(userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User topilmadi');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  genAccessToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.ACCKEY,
      expiresIn: '2h',
    });
  }

  genRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.REFKEY,
      expiresIn: '5d',
    });
  }
}

