import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class PayByMonthsDto {
  @ApiProperty({ example: 'uuid-of-debt' })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  debtId: string;

  @ApiProperty({ example: [3, 4, 5], description: 'Ketma-ket oylar' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  months: number[];
}
