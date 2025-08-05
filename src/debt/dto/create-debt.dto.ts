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

  @ApiProperty({ example: 600000 })
  @IsInt()
  @IsNotEmpty()
  total_amount: number;

  @ApiProperty({ example: 100000 })
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

  @ApiProperty({ example: 'LG Televizor 55"' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ example: 'Yangi mahsulot', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  
}

