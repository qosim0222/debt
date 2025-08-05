import {
  BadRequestException,
  Injectable,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  // --- Statusni tekshiruvchi yordamchi funksiya
  private async updateDebtStatus(debtId: string) {
    const totalPaid = (
      await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { debtId },
      })
    )._sum.amount || 0;

    const debt = await this.prisma.debt.findUnique({ where: { id: debtId } });
    if (!debt) throw new NotFoundException('Qarz topilmadi');

    const status = totalPaid >= debt.total_amount;
    await this.prisma.debt.update({
      where: { id: debtId },
      data: { status },
    });
  }

  async create(dto: CreatePaymentDto, userId: string) {
    const { amount, method, debtId, customerId, monthNumber } = dto;

    // --- 1. Qarzdorlik va mijoz mavjudligini tekshirish
    const [debt, customer] = await Promise.all([
      this.prisma.debt.findUnique({
        where: { id: debtId },
        include: { Payment: true },
      }),
      this.prisma.customer.findUnique({ where: { id: customerId } }),
    ]);

    if (!debt) throw new NotFoundException('Qarz topilmadi');
    if (!customer) throw new NotFoundException('Mijoz topilmadi');

    const paymentsToCreate: any[] = [];

    // --- 2. FULL — To‘liq to‘lov
    if (method === PaymentMethod.FULL) {
      if (debt.Payment.length > 0)
        throw new BadRequestException("Bu qarzga allaqachon to'lov qilingan");

      if (amount !== debt.total_amount)
        throw new BadRequestException("To'liq to'lov uchun miqdor noto'g'ri");

      paymentsToCreate.push({
        amount,
        method,
        debtId,
        customerId,
        userId,
      });
    }
    

    // --- 3. BY_MONTH — avtomatik bir nechta oylik to‘lov
    else if (method === PaymentMethod.BY_MONTH) {
      const paidMonths = debt.Payment
        .filter(p => p.monthNumber !== null)
        .map(p => p.monthNumber);

      const unpaidMonths = Array.from(
        { length: debt.deadline_months },
        (_, i) => i + 1,
      ).filter(month => !paidMonths.includes(month));

      let remaining = amount;

      for (const m of unpaidMonths) {
        if (remaining < debt.monthly_amount) break;

        paymentsToCreate.push({
          amount: debt.monthly_amount,
          method,
          monthNumber: m,
          debtId,
          customerId,
          userId,
        });

        remaining -= debt.monthly_amount;
      }

      if (paymentsToCreate.length === 0) {
        throw new BadRequestException(
          "To'lov miqdori yetarli emas yoki barcha oylar to'langan",
        );
      }
    }

    // --- 4. PARTIAL / ANY_AMOUNT — istalgan miqdor (kam bo‘lishi mumkin)
    else if (
      method === PaymentMethod.PARTIAL ||
      method === PaymentMethod.PARTIAL
    ) {
      if (amount <= 0)
        throw new BadRequestException(
          "To'lov miqdori nol yoki manfiy bo'lishi mumkin emas",
        );

      paymentsToCreate.push({
        amount,
        method,
        debtId,
        customerId,
        userId,
      });
    }

    // --- 5. To‘lovlarni bazaga yozish
    if (paymentsToCreate.length > 1) {
      await this.prisma.payment.createMany({ data: paymentsToCreate });
    } else {
      await this.prisma.payment.create({ data: paymentsToCreate[0] });
    }

    // --- 6. Statusni yangilash
    await this.updateDebtStatus(debtId);

    // --- 7. Mijozga xabar yuborish
    const totalPaid = (
      await this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { debtId },
      })
    )._sum.amount || 0;

    const remaining = Math.max(debt.total_amount - totalPaid, 0);
    await this.prisma.message.create({
      data: {
        customerId,
        text: `Siz ${amount.toLocaleString()} so'm to'lov qildingiz. Qolgan qarzingiz: ${remaining.toLocaleString()} so'm.`,
        sampleId: null,
      },
    });

    return { message: "To'lov muvaffaqiyatli bajarildi" };
  }

  async findAll() {
    const data = await this.prisma.payment.findMany({
      include: { customer: true, debt: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
    return { data };
  }

  async findOne(id: string) {
    const data = await this.prisma.payment.findUnique({
      where: { id },
      include: { customer: true, debt: true, user: true },
    });
    if (!data) throw new NotFoundException("To'lov topilmadi");
    return { data };
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const exist = await this.prisma.payment.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException("To'lov topilmadi");

    const updated = await this.prisma.payment.update({
      where: { id },
      data: dto,
    });

    await this.updateDebtStatus(updated.debtId);
    return { message: "To'lov yangilandi", data: updated };
  }

  async remove(id: string) {
    const exist = await this.prisma.payment.findUnique({ where: { id } });
    if (!exist) throw new NotFoundException("To'lov topilmadi");

    const deleted = await this.prisma.payment.delete({ where: { id } });
    await this.updateDebtStatus(deleted.debtId);

    return { message: "To'lov o'chirildi", data: deleted };
  }
}
