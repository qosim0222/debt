import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';

@Injectable()
export class SampleService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSampleDto, userId: string) {
    try {
      const data = await this.prisma.sample.create({
        data: { ...dto, userId, isActive: true },
      });
      return { message: 'Namuna yaratildi', data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
async findAll(
  userId: string,
  page: number = 1,
  limit: number = 10,
  sortOrder: 'asc' | 'desc' = 'desc',
) {
  try {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.sample.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
      }),
      this.prisma.sample.count({ where: { userId } }),
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


  async findOne(id: string, userId: string) {
    try {
      const data = await this.prisma.sample.findFirst({ where: { id, userId } });
      if (!data) throw new NotFoundException('Namuna topilmadi');
      return { data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, dto: UpdateSampleDto, userId: string) {
    try {
      const exist = await this.prisma.sample.findFirst({ where: { id, userId } });
      if (!exist) throw new NotFoundException('Namuna topilmadi');

      const data = await this.prisma.sample.update({
        where: { id },
        data: dto,
      });
      return { message: 'Namuna yangilandi', data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async toggle(id: string, userId: string) {
    try {
      const exist = await this.prisma.sample.findFirst({ where: { id, userId } });
      if (!exist) throw new NotFoundException('Namuna topilmadi');

      const data = await this.prisma.sample.update({
        where: { id },
        data: { isActive: !exist.isActive },
      });
      return { message: 'Holat o‘zgartirildi', data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string, userId: string) {
    try {
      const exist = await this.prisma.sample.findFirst({ where: { id, userId } });
      if (!exist) throw new NotFoundException('Namuna topilmadi');

      const data = await this.prisma.sample.delete({ where: { id } });
      return { message: 'Namuna o‘chirildi', data };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
