import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnyAmountPaymentDto } from './dto/any-amount-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { OneMonthPaymentDto } from './dto/one-month-payment.dto.ts';
import { PayByMonthsDto } from './dto/by-months.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  // 🔹 Yagona helper: tx ixtiyoriy, Payment SUM(amount) bilan Debtni sinxronlaydi

private async updateDebtStatus(
  debtId: string,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const db = tx ?? this.prisma;

  const agg = await db.payment.aggregate({
    where: { debtId },
    _sum: { amount: true },
  });
  const paid = agg._sum.amount ?? 0;

  const debt = await db.debt.findUnique({
    where: { id: debtId },
    select: { total_amount: true },
  });
  if (!debt) return;

  await db.debt.update({
    where: { id: debtId },
    data: {
      paid_amount: paid,
      status: paid >= debt.total_amount,
    },
  });
}
async payOneMonth(dto: OneMonthPaymentDto, userId: string) {
  const debt = await this.prisma.debt.findUnique({
    where: { id: dto.debtId },
    include: { Payment: { select: { monthNumber: true } } },
  });
  if (!debt) throw new NotFoundException('Qarz topilmadi');
  if (debt.status) throw new BadRequestException('Bu qarz allaqachon yopilgan');

  const paidMonths = debt.Payment.map(p => p.monthNumber).filter((m): m is number => m != null);
  const allMonths = Array.from({ length: debt.deadline_months }, (_, i) => i + 1);
  const unpaid = allMonths.filter(m => !paidMonths.includes(m));
  if (unpaid.length === 0) throw new BadRequestException('Barcha oylar to‘langan');

  const monthNumber = unpaid[0];

  await this.prisma.$transaction(async (tx) => {
    // Hozirgi paid va remainingni tranzaksiya ichida hisoblang
    const agg = await tx.payment.aggregate({ where: { debtId: dto.debtId }, _sum: { amount: true } });
    const currentPaid = agg._sum.amount ?? 0;
    const remaining = debt.total_amount - currentPaid;
    if (debt.monthly_amount > remaining) {
      throw new BadRequestException(`Qolgan qarz ${remaining} so‘m. Oylik ${debt.monthly_amount} so‘m sig‘maydi.`);
    }

    await tx.payment.create({
      data: { amount: debt.monthly_amount, monthNumber, debtId: dto.debtId, userId },
    });

    await this.updateDebtStatus(dto.debtId, tx);
  });

  return { message: `${monthNumber}-oy uchun to‘lov qabul qilindi` };
}

async payAnyAmount(dto: AnyAmountPaymentDto, userId: string) {
  const debt = await this.prisma.debt.findUnique({ where: { id: dto.debtId } });
  if (!debt) throw new NotFoundException('Qarz topilmadi');
  if (debt.status) throw new BadRequestException('Bu qarz allaqachon yopilgan');

  await this.prisma.$transaction(async (tx) => {
    const agg = await tx.payment.aggregate({ where: { debtId: dto.debtId }, _sum: { amount: true } });
    const currentPaid = agg._sum.amount ?? 0;
    const remaining = debt.total_amount - currentPaid;
    if (dto.amount > remaining) {
      throw new BadRequestException(`Qolgan qarz ${remaining} so‘m. Ortig‘ini to‘lolmaysiz.`);
    }

    await tx.payment.create({
      data: { amount: dto.amount, debtId: dto.debtId, userId },
    });

    await this.updateDebtStatus(dto.debtId, tx);
  });

  return { message: `${dto.amount.toLocaleString()} so‘m qabul qilindi` };
}

async payByMonths(dto: PayByMonthsDto, userId: string) {
  const debt = await this.prisma.debt.findUnique({
    where: { id: dto.debtId },
    include: { Payment: { select: { monthNumber: true } } },
  });
  if (!debt) throw new NotFoundException('Qarz topilmadi');
  if (debt.status) throw new BadRequestException('Bu qarz allaqachon yopilgan');

  const paidMonths = debt.Payment.map(p => p.monthNumber).filter((m): m is number => m != null);
  const allMonths = Array.from({ length: debt.deadline_months }, (_, i) => i + 1);
  const unpaid = allMonths.filter(m => !paidMonths.includes(m));
  if (unpaid.length === 0) throw new BadRequestException('Barcha oylar to‘langan');

  const selected = Array.from(new Set(dto.months)).sort((a, b) => a - b);

  // diapazon va ketma-ketlik tekshiruvi
  for (const m of selected) {
    if (m < 1 || m > debt.deadline_months) throw new BadRequestException(`${m}-oy mavjud emas`);
    if (!unpaid.includes(m)) throw new BadRequestException(`${m}-oy allaqachon to‘langan`);
  }
  const nextUnpaid = unpaid[0];
  if (selected[0] !== nextUnpaid) throw new BadRequestException(`Avval ${nextUnpaid}-oy to‘lanishi kerak`);
  for (let i = 1; i < selected.length; i++) {
    if (selected[i] !== selected[0] + i) throw new BadRequestException('Oylar ketma-ket bo‘lishi kerak');
  }

  await this.prisma.$transaction(async (tx) => {
    const agg = await tx.payment.aggregate({ where: { debtId: dto.debtId }, _sum: { amount: true } });
    const currentPaid = agg._sum.amount ?? 0;
    const remaining = debt.total_amount - currentPaid;

    const need = selected.length * debt.monthly_amount;
    if (need > remaining) {
      throw new BadRequestException(
        `Qolgan qarz ${remaining.toLocaleString()} so‘m. Kerak: ${need.toLocaleString()} so‘m.`,
      );
    }

    await tx.payment.createMany({
      data: selected.map(m => ({
        amount: debt.monthly_amount,
        monthNumber: m,
        debtId: dto.debtId,
        userId,
      })),
    });

    await this.updateDebtStatus(dto.debtId, tx);
  });

  return { message: `${selected.length} oy uchun to‘lov qabul qilindi` };
}

async findAll(
  debtId?: string,
  page: number = 1,
  limit: number = 10,
  sortOrder: 'asc' | 'desc' = 'desc',
) {
  try {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (debtId) {
      where.debtId = debtId;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          debt: { include: { customer: true } },
          user: true,
        },
        orderBy: { createdAt: sortOrder },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}


  async findOne(id: string) {
    const data = await this.prisma.payment.findUnique({
      where: { id },
      include: { debt: { include: { customer: true } }, user: true },
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






//   // ixtiyoriy: tarix endpointlari
//   async findAll() {
//     const data = await this.prisma.payment.findMany({
//       include: { debt: { include: { customer: true } }, user: true },
//       orderBy: { createdAt: 'desc' },
//     });
//     return { data };
//   }

//   async findOne(id: string) {
//     const data = await this.prisma.payment.findUnique({
//       where: { id },
//       include: { debt: { include: { customer: true } }, user: true },
//     });
//     if (!data) throw new NotFoundException("To'lov topilmadi");
//     return { data };
//   }
// }








// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
//   HttpException,
// } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { CreatePaymentDto } from './dto/create-payment.dto';
// import { UpdatePaymentDto } from './dto/update-payment.dto';
// import { PaymentMethod } from '@prisma/client';

// @Injectable()
// export class PaymentService {
//   constructor(private prisma: PrismaService) { }

//   async create(dto: CreatePaymentDto, userId: string) {
//     try {
//       const { method, amount, debtId  } = dto;
      

//        const result = await this.prisma.$transaction(async (tx) => {
//        const debt = await tx.debt.findUnique({
//           where: { id: debtId },
//           include: { Payment: true , customer:true},
//         });
      

//       if (!debt) throw new NotFoundException('DebtId topilmadi');
//       const paymentsToCreate: any[] = [];

    
        

//           if (method === PaymentMethod.FULL) {
//             if (debt.Payment.length > 0)
//               throw new BadRequestException("Bu qarzga allaqachon to'lov qilingan");

//             if (amount !== debt.total_amount)
//               throw new BadRequestException("To'liq to'lov uchun miqdor noto'g'ri");

//             paymentsToCreate.push({
//               amount,
//               method,
//               debtId,
//               userId,
//             });

//             await tx.debt.update({
//               where: { id: debtId },
//               data: {
//                 paid_amount: amount,
//                 status: true,
//               },
//             });
//           }


//           else if (method === PaymentMethod.BY_MONTH) {
//             const paidMonths = debt.Payment
//               .filter((p) => p.monthNumber !== null)
//               .map((p) => p.monthNumber);

//             const unpaidMonths = Array.from(
//               { length: debt.deadline_months },
//               (_, i) => i + 1,
//             ).filter((m) => !paidMonths.includes(m));

//             const remainingDebt = debt.total_amount - debt.paid_amount;

//             if (amount < debt.monthly_amount) {
//               throw new BadRequestException(`Minimal oylik to'lov miqdori ${debt.monthly_amount} so'm. Faqat to'liq oylik to'lovlar qabul qilinadi.`);
//             }

//             if (amount > remainingDebt) {
//               throw new BadRequestException(`Siz  ortiqcha to'lov qilyapsiz. Qolgan qarz miqdori ${remainingDebt} so'm.`);
//             }

//             if (amount % debt.monthly_amount !== 0) {
//               const acceptedAmount = Math.floor(amount / debt.monthly_amount) * debt.monthly_amount;
//               const extra = amount - acceptedAmount;
//               throw new BadRequestException(
//                 `Faqat to'liq oylik to'lovlar qabul qilinadi (${debt.monthly_amount} so'm). ` +
//                 `Siz ${extra} so'm ortiqcha kiritdingiz.`
//               );
//             }


//             const maxPayableMonths = Math.floor(amount / debt.monthly_amount);
//             const monthsToPay = unpaidMonths.slice(0, maxPayableMonths);
//             const totalPaid = monthsToPay.length * debt.monthly_amount;

//             if (monthsToPay.length === 0) {
//               throw new BadRequestException("Barcha oylar to'langan");
//             }

//             // 5. Kiritilgan oylik miqdor kerakli oylardan oshib ketmasligi kerak
//             if (totalPaid !== amount) {
//               throw new BadRequestException("Kiritilgan to'lov noto'g'ri oyliklarga to'g'ri kelmadi");
//             }

//             for (const month of monthsToPay) {
//               paymentsToCreate.push({
//                 amount: debt.monthly_amount,
//                 method,
//                 monthNumber: month,
//                 debtId,
//                 userId,
//               });
//             }

//             const updated = await tx.debt.update({
//               where: { id: debtId },
//               data: {
//                 paid_amount: { increment: totalPaid },
//               },
//               select: { paid_amount: true, total_amount: true },
//             });

//             if (updated.paid_amount >= updated.total_amount) {
//               await tx.debt.update({
//                 where: { id: debtId },
//                 data: { status: true },
//               });
//             }
//           }

//           else if (method === PaymentMethod.PARTIAL) {
//             if (amount <= 0) {
//               throw new BadRequestException("To'lov miqdori nol yoki manfiy bo'lishi mumkin emas");}

//             const remainingAmount = debt.total_amount - debt.paid_amount;

//             if (amount > remainingAmount) {
//               throw new BadRequestException(
//                 `Sizning qolgan qarzingiz ${remainingAmount.toLocaleString()} so'm. ` +
//                 `Siz kiritgan miqdor esa ${amount.toLocaleString()} so'm. ` +
//                 `Iltimos, ortiqcha pul to'lamang.`
//               );
//             }

//             paymentsToCreate.push({
//               amount,
//               method,
//               debtId,
//               userId,
//             });

//             const updated = await tx.debt.update({
//               where: { id: debtId },
//               data: {
//                 paid_amount: { increment: amount },
//               },
//               select: { paid_amount: true, total_amount: true },
//             });

//             if (updated.paid_amount >= updated.total_amount) {
//               await tx.debt.update({
//                 where: { id: debtId },
//                 data: { status: true },
//               });
//             }
//           }


//           await tx.payment.createMany({ data: paymentsToCreate });

//           return paymentsToCreate;
          
//            });
       
     

//       return {
//         message: "To'lov muvaffaqiyatli bajarildi",
//         data: result,
//       };
//     } catch (error) {
//       throw new BadRequestException(error.message || 'Xatolik yuz berdi');
//     }
//   }



//   async findAll() {
//     const data = await this.prisma.payment.findMany({
//       include: { customer: true, debt: true, user: true },
//       orderBy: { createdAt: 'desc' },
//     });
//     return { data };
//   }

//   async findOne(id: string) {
//     const data = await this.prisma.payment.findUnique({
//       where: { id },
//       include: { customer: true, debt: true, user: true },
//     });
//     if (!data) throw new NotFoundException("To'lov topilmadi");
//     return { data };
//   }

//   async update(id: string, dto: UpdatePaymentDto) {
//     const exist = await this.prisma.payment.findUnique({ where: { id } });
//     if (!exist) throw new NotFoundException("To'lov topilmadi");

//     const updated = await this.prisma.payment.update({
//       where: { id },
//       data: dto,
//     });

//     await this.updateDebtStatus(updated.debtId);
//     return { message: "To'lov yangilandi", data: updated };
//   }
//   updateDebtStatus(debtId: string) {
//     throw new Error('Method not implemented.');
//   }

//   async remove(id: string) {
//     const exist = await this.prisma.payment.findUnique({ where: { id } });
//     if (!exist) throw new NotFoundException("To'lov topilmadi");

//     const deleted = await this.prisma.payment.delete({ where: { id } });
//     await this.updateDebtStatus(deleted.debtId);

//     return { message: "To'lov o'chirildi", data: deleted };
//   }
// }

