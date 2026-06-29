import { IsString, IsEmail, IsOptional, Length } from 'class-validator';

export class SendOtpDto {
  @IsEmail()
  email: string;
}

export class CreateContactDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  message: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}
