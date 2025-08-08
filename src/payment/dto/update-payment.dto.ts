import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional({ example: 2, description: "Oylik to'lov bo'lsa" })
  @IsOptional()
  @IsInt()
  @Min(1)
  monthNumber?: number;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  debtId?: string;
}
