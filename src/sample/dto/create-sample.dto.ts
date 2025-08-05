import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSampleDto {

    @ApiProperty({example:"bu namuna"})
    @IsString()
    @IsNotEmpty()
    text:string
}

