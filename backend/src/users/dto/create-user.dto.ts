import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: 'Username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'securePassword123', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ enum: Role, example: 'MEMBER', description: 'User role' })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({ example: true, description: 'Is user enabled', required: false })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ example: false, description: 'Is email verified', required: false })
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;
}
