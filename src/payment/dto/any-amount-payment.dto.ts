import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min, IsString, IsUUID } from 'class-validator';

export class AnyAmountPaymentDto {
  @ApiProperty({ example: 'uuid-of-debt' })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  debtId: string;

  @ApiProperty({ example: 400000 })
  @IsInt()
  @Min(1)
  amount: number;
}
