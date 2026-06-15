import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoggerDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 12)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 14)
  password: string;
}
