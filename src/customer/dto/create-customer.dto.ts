import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class CreateCustomerDto {

    @ApiProperty({ example: "Begzod" })
    @IsString()
    @IsNotEmpty()
    fullname: string

    @ApiProperty({ example: "toshkent" })
    @IsString()
    @IsNotEmpty()
    address: string

    @IsString()
    @IsOptional()
    note: string


    @ApiProperty({ type: [String], example: ['+998901234567', '+998901234567'] })
    @IsArray()
    @IsOptional()
    @Matches(/^\+998[0-9]{2}\d{7}$/, { message: "Telefon raqami formati faqat: +998901234567 bo'lishi kerak" })
    phones?: string[];

    @ApiProperty({ type: [String], example: ['image1.jpg', 'image2.png'] })
    @IsArray()
    @IsOptional()
    images?: string[];

}
