import {IsString, IsNotEmpty, MinLength} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({
    description: 'Username',
    example: 'owner',
  })
  @IsString()
  @IsNotEmpty()
  username: string

  @ApiProperty({
    description: 'Password',
    example: 'owner',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string
}
