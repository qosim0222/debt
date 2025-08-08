import { ApiProperty } from "@nestjs/swagger";
import { userRole } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, matches } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ example: 'Ali Valiyev' })
    @IsString()
    @IsNotEmpty()
    fullname: string;

    @ApiProperty({ example: 'ali' })
    @IsString()
    @IsNotEmpty()
    userName: string;

    @ApiProperty({ example: '+998901234567' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+998[0-9]{2}\d{7}$/, { message: "Telefon raqami formati faqat: +998901234567 bo'lishi kerak" })
    phone: string;

    @ApiProperty({ example: 'chilonzor' })
    @IsString()
    @IsNotEmpty()
    adress: string;

    @ApiProperty({ example: 'image url' })
    @IsString()
    @IsOptional()
    image: string;

    @ApiProperty({ example: '1207' })
    @IsString()
    @IsNotEmpty()
    password: string;

    // @ApiProperty({ example: 'SELLER', enum: userRole })
    // @IsEnum(userRole)
    // role: userRole;
}
