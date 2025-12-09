import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import {JwtService} from '@nestjs/jwt'
import {ConfigService} from '@nestjs/config'
import {PrismaService} from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import {v4 as uuidv4} from 'uuid'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {username},
    })

    if (!user) {
      return null
    }

    if (!user.enabled) {
      throw new UnauthorizedException('User account is disabled')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return null
    }

    // Update last login
    await this.prisma.user.update({
      where: {id: user.id},
      data: {
        lastLogin: new Date(),
        firstLogin: user.firstLogin || new Date(),
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password: _, ...result} = user
    return result
  }

  async login(user: any) {
    const payload = {
      sub: user.username,
      username: user.username,
      role: user.role,
      tree: 'gramps', // Default tree name
      permissions: {
        canUseChat: true,
      },
    }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    })

    const refreshToken = await this.createRefreshToken(user.id)

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  async createRefreshToken(userId: string): Promise<string> {
    const token = uuidv4()
    const expiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d'

    // Convert expiry string to milliseconds
    const expiryMs = this.parseExpiry(expiresIn)
    const expiresAt = new Date(Date.now() + expiryMs)

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    })

    return token
  }

  async refreshAccessToken(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: {token: refreshToken},
      include: {user: true},
    })

    if (!tokenRecord || tokenRecord.revoked) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired')
    }

    const payload = {
      sub: tokenRecord.user.username,
      username: tokenRecord.user.username,
      role: tokenRecord.user.role,
      tree: 'gramps',
      permissions: {
        canUseChat: true,
      },
    }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    })

    return {
      access_token: accessToken,
    }
  }

  async revokeRefreshToken(token: string) {
    await this.prisma.refreshToken.updateMany({
      where: {token},
      data: {revoked: true},
    })
  }

  private parseExpiry(expiry: string): number {
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    }

    const match = expiry.match(/^(\d+)([smhd])$/)
    if (!match) {
      throw new BadRequestException('Invalid expiry format')
    }

    const [, value, unit] = match
    return parseInt(value, 10) * units[unit]
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
  }
}
