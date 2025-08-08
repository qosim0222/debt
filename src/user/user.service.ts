import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import *as bcrypt from "bcrypt"

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }
  async create(dto: CreateUserDto) {
    const { userName, password, phone } = dto;

    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { userName },
      });

      if (existingUser) {
        throw new ConflictException('Foydalanuvchi allaqachon mavjud');
      }

       const existingPhone = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      throw new ConflictException('Bu telefon raqam allaqachon ro‘yxatdan o‘tgan');
    }

      const hashedPassword = await bcrypt.hash(password, 10);

      const data = await this.prisma.user.create({
        data: {
          ...dto,
          password: hashedPassword,
        },
      });

      return { data };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message || 'nimadur xato');
    }
  }


  async findAll(
  page: number = 1,
  limit: number = 10,
  search?: string,
) {
  try {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { fullname: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      total,
      currentPage: page,
      totalPages,
    };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}



  async findOne(id: string) {
    try {
      const data = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!data) {
        throw new NotFoundException('User topilmadi');
      }

      return { data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const exist = await this.prisma.user.findUnique({ where: { id } });

      if (!exist) {
        throw new NotFoundException('User topilmadi');
      }

      const data = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });

      return { data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const exist = await this.prisma.user.findUnique({ where: { id } });

      if (!exist) {
        throw new NotFoundException('User topilmadi');
      }

      const data = await this.prisma.user.delete({ where: { id } });
      return { data };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new BadRequestException(error.message);
    }
  }

  
}
