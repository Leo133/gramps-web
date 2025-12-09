import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        enabled: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });
    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        enabled: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updateData: Partial<UpdateUserDto> = { ...updateUserDto };
    
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        enabled: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    return user;
  }

  async remove(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateLastLogin(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }
}
