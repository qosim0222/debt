import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateSampleDto } from './create-sample.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSampleDto extends PartialType(CreateSampleDto) {

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
