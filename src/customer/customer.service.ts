import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) { }


  async create(dto: CreateCustomerDto, userId: string) {
    try {
      if (dto.phones?.length) {
        const existingPhones = await this.prisma.customerPhone.findMany({
          where: {
            phone: { in: dto.phones },
          },
          select: { phone: true },
        });

        if (existingPhones.length > 0) {
          const list = existingPhones.map((p) => p.phone).join(', ');
          throw new BadRequestException(
            `Quyidagi telefon raqam(lar)i allaqachon ro'yxatdan o'tgan: ${list}`
          );
        }
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const customer = await tx.customer.create({
          data: {
            fullname: dto.fullname,
            address: dto.address,
            note: dto.note || '',
            userId,
          },
        });


        if (dto.phones?.length) {
          await tx.customerPhone.createMany({
            data: dto.phones.map((phone) => ({
              phone,
              customerId: customer.id,
            })),
          });
        }


        if (dto.images?.length) {
          await tx.customerImage.createMany({
            data: dto.images.map((image) => ({
              image,
              customerId: customer.id,
            })),
          });
        }

        return customer;
      });

      return { message: 'Mijoz muvaffaqiyatli yaratildi', data: result };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  
async findAll(
  search?: string,
  page: number = 1,
  limit: number = 10,
  sortBy: 'createdAt' | 'fullname' = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
) {
  try {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { fullname: { contains: search, mode: 'insensitive' } },
        { CustomerPhone: { some: { phone: { contains: search } } } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: {
          CustomerPhone: { select: { phone: true } },
          CustomerImage: { select: { image: true } },
          Debt: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.customer.count({ where }),
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
      const data = await this.prisma.customer.findUnique({
        where: { id },
        include: {
          CustomerPhone: { select: { phone: true } },
          CustomerImage: { select: { image: true } },
          Debt: {
            include: {
              Payment: true,
            },
          },
        },
      });

      if (!data) {
        throw new NotFoundException('Mijoz topilmadi');
      }

      return { data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }


  async update(id: string, dto: UpdateCustomerDto) {
    try {
      const exist = await this.prisma.customer.findUnique({ where: { id } });
      if (!exist) throw new NotFoundException('Mijoz topilmadi');

      const updated = await this.prisma.customer.update({
        where: { id },
        data: {
          fullname: dto.fullname,
          address: dto.address,
          note: dto.note,
        },
      });

      return { message: 'Mijoz yangilandi', data: updated };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const exist = await this.prisma.customer.findUnique({ where: { id } });
      if (!exist) throw new NotFoundException('Mijoz topilmadi');

      await this.prisma.customer.delete({ where: { id } });
      return { message: "Mijoz o'chirildi" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }
  
async getCustomerDebts(id: string) {
  try {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        Debt: {
          select: {
            total_amount: true,
            paid_amount: true,
          },
        },
      },
    });

    if (!customer) throw new NotFoundException('Mijoz topilmadi');

    const totalDebt = customer.Debt.reduce(
      (sum, debt) => sum + (debt.total_amount - (debt.paid_amount ?? 0)),
      0,
    );

    return { totalDebt };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}
}

