import { IsString, Length } from 'class-validator';

export class VerifyCodeDto {
  @IsString()
  @Length(6, 6)
  code: string;
}
