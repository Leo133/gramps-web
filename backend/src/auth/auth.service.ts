import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.enabled) {
      throw new UnauthorizedException('User account is disabled');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      permissions: this.getPermissionsForRole(user.role),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      permissions: this.getPermissionsForRole(user.role),
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
    };
  }

  private getPermissionsForRole(role: string): Record<string, boolean> {
    const permissions: Record<string, boolean> = {
      canRead: true,
      canWrite: false,
      canDelete: false,
      canManageUsers: false,
      canUseChat: false,
    };

    switch (role) {
      case 'OWNER':
        permissions.canWrite = true;
        permissions.canDelete = true;
        permissions.canManageUsers = true;
        permissions.canUseChat = true;
        break;
      case 'EDITOR':
        permissions.canWrite = true;
        permissions.canDelete = true;
        permissions.canUseChat = true;
        break;
      case 'CONTRIBUTOR':
        permissions.canWrite = true;
        permissions.canUseChat = true;
        break;
      case 'MEMBER':
        permissions.canUseChat = true;
        break;
      case 'GUEST':
        break;
    }

    return permissions;
  }
}
