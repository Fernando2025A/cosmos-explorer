import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 12)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 14)
  password: string;
}
