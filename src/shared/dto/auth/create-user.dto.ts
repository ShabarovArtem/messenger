import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail({}, { message: 'Некорректный email' })
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Минимум 6 символов' })
  password: string;

  @IsOptional()
  @IsString()
  name: string;
}
