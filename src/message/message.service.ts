import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMessageDto) {
    try {
      const { customerId, sampleId } = dto;

      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) throw new NotFoundException('Mijoz topilmadi');

      if (sampleId) {
        const sample = await this.prisma.sample.findUnique({
          where: { id: sampleId },
        });
        if (!sample) throw new NotFoundException('Namunaviy xabar topilmadi');
      }

      const data = await this.prisma.message.create({
        data: dto,
      });

      return { message: 'Xabar muvaffaqiyatli yaratildi', data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const data = await this.prisma.message.findMany({
        include: {
          customer: {
            select: { id: true, fullname: true },
          },
          sample: {
            select: { id: true, text: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return { data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const data = await this.prisma.message.findUnique({
        where: { id },
        include: {
          customer: { select: { id: true, fullname: true } },
          sample: { select: { id: true, text: true } },
        },
      });

      if (!data) throw new NotFoundException('Xabar topilmadi');
      return { data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, dto: UpdateMessageDto) {
    try {
      const exist = await this.prisma.message.findUnique({ where: { id } });
      if (!exist) throw new NotFoundException('Xabar topilmadi');

      if (dto.sampleId) {
        const sample = await this.prisma.sample.findUnique({
          where: { id: dto.sampleId },
        });
        if (!sample) throw new NotFoundException('Namunaviy xabar topilmadi');
      }

      const data = await this.prisma.message.update({
        where: { id },
        data: dto,
      });

      return { message: 'Xabar yangilandi', data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const exist = await this.prisma.message.findUnique({ where: { id } });
      if (!exist) throw new NotFoundException('Xabar topilmadi');

      const data = await this.prisma.message.delete({ where: { id } });
      return { message: "Xabar ochirildi", data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }
}
