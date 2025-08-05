import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateMessageDto {
  @ApiProperty({ example: "Message" })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: "uuid-mijoz-id" })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: "uuid-sample-id" })
  @IsString()
  @IsNotEmpty()
  sampleId: string;
}
