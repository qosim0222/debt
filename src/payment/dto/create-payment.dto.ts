import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ example: 100000 })
  @IsInt()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.FULL })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  monthNumber?: number;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  debtId: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  customerId: string;
}

