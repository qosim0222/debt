import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class OneMonthPaymentDto {
  @ApiProperty({ example: 'uuid-of-debt' })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  debtId: string;
}
