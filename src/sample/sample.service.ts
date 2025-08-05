import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';

@Injectable()
export class SampleService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSampleDto, userId: string) {
    try {
      const data = await this.prisma.sample.create({
        data: {
          ...dto,
          userId,
        },
      });
      return {
        message: 'Namunaviy xabar yaratildi',
        data,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const data = await this.prisma.sample.findMany({
        include: {
          Message: {
            select: {
              id: true,
              customerId: true,
              text: true,
              createdAt: true,
            },
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
      const data = await this.prisma.sample.findUnique({
        where: { id },
        include: {
          Message: {
            select: {
              id: true,
              customerId: true,
              text: true,
              createdAt: true,
            },
          },
        },
      });

      if (!data) {
        throw new NotFoundException('Namunaviy xabar topilmadi');
      }

      return { data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, dto: UpdateSampleDto) {
    try {
      const exist = await this.prisma.sample.findUnique({ where: { id } });
      if (!exist) throw new NotFoundException('Namunaviy xabar topilmadi');

      const data = await this.prisma.sample.update({
        where: { id },
        data: dto,
      });

      return {
        message: 'Namunaviy xabar yangilandi',
        data,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const exist = await this.prisma.sample.findUnique({ where: { id } });
      if (!exist) throw new NotFoundException('Namunaviy xabar topilmadi');

      const data = await this.prisma.sample.delete({ where: { id } });

      return {
        message: 'Namunaviy xabar o‘chirildi',
        data,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }
}
