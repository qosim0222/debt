// message.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMessageDto) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) throw new NotFoundException('Mijoz topilmadi');

      const data = await this.prisma.message.create({
        data: {
          ...dto,
          status: 'SENT', 
        },
      });

      return { message: 'Xabar yaratildi', data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
async findAll(
  customerId?: string,
  page: number = 1,
  limit: number = 10,
  sortOrder: 'asc' | 'desc' = 'desc',
) {
  try {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) {
      where.customerId = customerId;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              fullname: true,
              CustomerPhone: { select: { phone: true } },
            },
          },
          sample: { select: { id: true, text: true } },
        },
        orderBy: { createdAt: sortOrder },
      }),
      this.prisma.message.count({ where }),
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
      const data = await this.prisma.message.findUnique({
        where: { id },
        include: {
         customer: { select: { id: true, fullname: true, CustomerPhone:{select:{phone:true}} } },
          sample: { select: { id: true, text: true } },
        },
      });
      if (!data) throw new NotFoundException('Xabar topilmadi');
      return { data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, dto: UpdateMessageDto) {
    try {
      const exist = await this.prisma.message.findUnique({ where: { id } });
      if (!exist) throw new NotFoundException('Xabar topilmadi');

      const data = await this.prisma.message.update({
        where: { id },
        data: dto,
      });

      return { message: 'Xabar yangilandi', data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const exist = await this.prisma.message.findUnique({ where: { id } });
      if (!exist) throw new NotFoundException('Xabar topilmadi');

      await this.prisma.message.delete({ where: { id } });

      return { message: "Xabar o'chirildi" };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
