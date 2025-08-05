import {
  BadRequestException,
  Injectable,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Injectable()
export class DebtService {
  constructor(private prisma: PrismaService) {}
async create(dto: CreateDebtDto) {
  try {
    const { customerId, total_amount, monthly_amount, deadline_months } = dto;

    // 1. Mijoz borligini tekshiramiz
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Mijoz topilmadi');
    }

    // 2. Oylik miqdor * oylar soni >= umumiy qarz bo‘lishi kerak
    const totalFromMonthly = monthly_amount * deadline_months;
    if (totalFromMonthly < total_amount) {
      throw new BadRequestException(
        `Har oylik to‘lov (${monthly_amount}) × oylar soni (${deadline_months}) = ${totalFromMonthly}, bu umumiy qarz (${total_amount}) dan kam. Iltimos, ma’lumotlarni tekshiring.`
      );
    }

    // 3. Qarzni yaratamiz
    const data = await this.prisma.debt.create({ data: dto });

    return { message: 'Qarz muvaffaqiyatli yaratildi', data };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}


  async findAll() {
    try {
      const data = await this.prisma.debt.findMany({
        include: { customer: true, Payment: true },
      });
      return { data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.prisma.debt.findUnique({
        where: { id },
        include: { customer: true, Payment: true },
      });
      if (!data) throw new NotFoundException('Qarzdorlik topilmadi');
      return { data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, dto: UpdateDebtDto) {
    try {
      const exist = await this.prisma.debt.findUnique({ where: { id } });
      if (!exist) throw new NotFoundException('Qarzdorlik topilmadi');

      const data = await this.prisma.debt.update({
        where: { id },
        data: dto,
      });

      return { data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const exist = await this.prisma.debt.findUnique({ where: { id } });
      if (!exist) throw new NotFoundException('Qarzdorlik topilmadi');

      const data = await this.prisma.debt.delete({ where: { id } });
      return { data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }
}
