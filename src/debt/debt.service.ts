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
  constructor(private prisma: PrismaService) { }
  async create(dto: CreateDebtDto) {
    try {
      const { customerId, total_amount, monthly_amount, deadline_months } = dto;
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        throw new NotFoundException('Mijoz topilmadi');
      }

     if (monthly_amount !== undefined && deadline_months !== undefined) {
        if (monthly_amount <= 0 || deadline_months <= 0) {
          throw new BadRequestException(
            "Oylik to'lov va oylar soni 0 dan katta bo'lishi kerak",
          );
        }
        
        const calc = monthly_amount * deadline_months;
        if (calc !== total_amount) {
          throw new BadRequestException(
            `Oylik to'lov (${monthly_amount}) * oylar soni (${deadline_months}) umumiy qarzga teng emas. Kiritilgan: ${calc}, kerak: ${total_amount}`,
          );
        }
      }

      const created = await this.prisma.$transaction(async (tx) => {
        const debt = await tx.debt.create({
          data: {
            customerId: dto.customerId,
            total_amount: dto.total_amount,
            monthly_amount: dto.monthly_amount,
            deadline_months: dto.deadline_months,
            startDate: dto.startDate,
            productName: dto.productName,
            note: dto.note,
            paid_amount: 0,
            status: false,
          },
          include:{DebtImage:{select:{image:true}}}
        });

        if (dto.images?.length) {
          await tx.debtImage.createMany({
            data: dto.images.map((image) => ({
              image,
              debtId: debt.id, 
            })),
          });
        }

        return debt;
      });

      return { message: 'Qarz yaratildi', data: created };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

async findAll(
  customerId?: string,
  search?: string,
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
) {
  try {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.customer = {
        fullname: { contains: search, mode: 'insensitive' },
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.debt.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          Payment: true,
          DebtImage: { select: { image: true } },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.debt.count({ where }),
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
    try {
      const data = await this.prisma.debt.findUnique({
        where: { id },
        include: { customer: true,
          DebtImage:{select:{image:true}},  
           Payment: true
         },
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

      return { message: 'Qarz yangilandi', data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const exist = await this.prisma.debt.findUnique({
        where: { id },
        include: { Payment: true },
      });
      if (!exist) throw new NotFoundException('Qarzdorlik topilmadi');

      if (exist.Payment.length > 0) {
        throw new BadRequestException("Bu qarz bo'yicha to'lovlar mavjud. Avval ularni o'chirishingiz kerak");
      }

      const data = await this.prisma.debt.delete({ where: { id } });
      return { message: "Qarz o'chirildi", data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }
}
