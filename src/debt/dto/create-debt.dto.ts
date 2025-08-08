import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateDebtDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 600 })
  @IsInt()
  @IsNotEmpty()
  total_amount: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @IsNotEmpty()
  monthly_amount: number;

  @ApiProperty({ example: 6 })
  @IsInt()
  @IsNotEmpty()
  deadline_months: number;

  @ApiProperty({ example: '2025-08-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: 'SAMSUNG GALAXY S21' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ example: 'Yangi mahsulot', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ type: [String], example: ['image1.jpg', 'image2.png'] })
  @IsArray()
  @IsOptional()
  images?: string[];


}

