import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsBoolean,
  IsOptional,
  IsIn,
} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  fullName?: string

  @ApiProperty({required: false, default: 'member'})
  @IsString()
  @IsOptional()
  @IsIn(['owner', 'editor', 'contributor', 'member'])
  role?: string

  @ApiProperty({required: false, default: false})
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean

  @ApiProperty({required: false, default: true})
  @IsBoolean()
  @IsOptional()
  enabled?: boolean
}

export class UpdateUserDto {
  @ApiProperty({required: false})
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  fullName?: string

  @ApiProperty({required: false})
  @IsString()
  @IsOptional()
  @IsIn(['owner', 'editor', 'contributor', 'member'])
  role?: string

  @ApiProperty({required: false})
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean

  @ApiProperty({required: false})
  @IsBoolean()
  @IsOptional()
  enabled?: boolean
}
