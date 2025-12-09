import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsBoolean, IsIn } from 'class-validator';

const VALID_ROLES = ['OWNER', 'EDITOR', 'CONTRIBUTOR', 'MEMBER', 'GUEST'] as const;

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

  @ApiProperty({ enum: VALID_ROLES, example: 'MEMBER', description: 'User role' })
  @IsIn(VALID_ROLES)
  @IsOptional()
  role?: string;

  @ApiProperty({ example: true, description: 'Is user enabled', required: false })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ example: false, description: 'Is email verified', required: false })
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;
}
