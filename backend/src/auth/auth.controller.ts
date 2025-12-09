import {Controller, Post, Body, UseGuards, HttpCode} from '@nestjs/common'
import {ApiTags, ApiOperation, ApiResponse} from '@nestjs/swagger'
import {AuthService} from './auth.service'
import {LocalAuthGuard} from './guards/local-auth.guard'
import {Public} from './decorators/auth.decorator'
import {CurrentUser} from './decorators/current-user.decorator'
import {LoginDto, RefreshTokenDto} from './dto/auth.dto'

@ApiTags('Authentication')
@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('token')
  @HttpCode(200)
  @ApiOperation({summary: 'Login and get access token'})
  @ApiResponse({status: 200, description: 'Successfully authenticated'})
  @ApiResponse({status: 401, description: 'Invalid credentials'})
  async login(@Body() loginDto: LoginDto, @CurrentUser() user: any) {
    return this.authService.login(user)
  }

  @Public()
  @Post('token/refresh')
  @HttpCode(200)
  @ApiOperation({summary: 'Refresh access token'})
  @ApiResponse({status: 200, description: 'Token refreshed successfully'})
  @ApiResponse({status: 401, description: 'Invalid refresh token'})
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refresh_token)
  }
}
