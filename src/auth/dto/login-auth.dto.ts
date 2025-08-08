import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, isString, IsString,  Matches,  MaxLength, MinLength } from "class-validator";

export class LoginAuthDto {

    @ApiProperty({example:"ali"})
    @IsString()
    @IsNotEmpty()
    userName:string

 
  @ApiProperty({ example: '1207' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: "Parol faqat harflar va raqamlardan iborat bo'lishi kerak."
  })

  @MinLength(4)
  @MaxLength(32)
  password: string;
}


export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh_token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ResetPasswordDto {
    @ApiProperty()
    @IsString()
    password:string

}
 