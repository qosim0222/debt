import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: 'uuid-customer-id' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  // @ApiPropertyOptional({ example: 'uuid-sample-id' })
  @IsUUID()
  @IsOptional()
  sampleId?: string;

  @ApiProperty({ example: 'Assalomu alaykum, eslatma...' })
  @IsString()
  @IsNotEmpty()
  text: string;
}
