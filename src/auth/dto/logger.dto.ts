import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoggerDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 100)
  identifier: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 14)
  password: string;
}
