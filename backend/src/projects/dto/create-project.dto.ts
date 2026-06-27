import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
