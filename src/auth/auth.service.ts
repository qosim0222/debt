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
  
  // auth.service.ts
async me_data(req: any) {
  try {
    const userId = req.user.id;

    // Umumiy qarz summasi
    const totalDebtAgg = await this.prisma.debt.aggregate({
      _sum: { total_amount: true },
      where: {
        customer: { userId }
      }
    });

    // Kechiktirilgan to‘lovlar soni
    const overdueDebtsCount = await this.prisma.debt.count({
      where: {
        customer: { userId },
        status: false,
        startDate: { lt: new Date() }
      }
    });

    // Mijozlar soni
    const debtorsCount = await this.prisma.customer.count({
      where: { userId }
    });

    // Foydalanuvchi ma’lumotlari
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        fullname: true,
        image: true,
        phone:true,
        userName:true
      }
    });

    // Hamyon — to‘langan pullar yig‘indisi
    const walletAgg = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        debt: { customer: { userId } }
      }
    });

    return {
      data: {
        fullName: user?.fullname || '',
        img: user?.image || '',
        phone:user?.phone|| '',
        userName: user?.userName|| '',
        totalDebt: totalDebtAgg._sum.total_amount || 0,
        overdueDebts: overdueDebtsCount || 0,
        debtors: debtorsCount || 0,
        wallet: walletAgg._sum.amount || 0
      }
    };
  } catch (error) {
    throw new BadRequestException(error.message);
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

