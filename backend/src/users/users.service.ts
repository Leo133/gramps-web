import {Injectable, NotFoundException} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'
import {CreateUserDto, UpdateUserDto} from './dto/user.dto'
import {AuthService} from '../auth/auth.service'

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.authService.hashPassword(
      createUserDto.password,
    )

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role || 'member',
        emailVerified: createUserDto.emailVerified || false,
        enabled:
          createUserDto.enabled !== undefined ? createUserDto.enabled : true,
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {password, ...result} = user
    return result
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        emailVerified: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
        firstLogin: true,
        lastLogin: true,
      },
    })
    return users
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {id},
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        emailVerified: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
        firstLogin: true,
        lastLogin: true,
      },
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id)

    const updateData: Partial<UpdateUserDto> & {password?: string} = {
      ...updateUserDto,
    }

    if (updateUserDto.password) {
      updateData.password = await this.authService.hashPassword(
        updateUserDto.password,
      )
    }

    const updatedUser = await this.prisma.user.update({
      where: {id: user.id},
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        emailVerified: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
        firstLogin: true,
        lastLogin: true,
      },
    })

    return updatedUser
  }

  async remove(id: string) {
    const user = await this.findOne(id)
    await this.prisma.user.delete({
      where: {id: user.id},
    })
    return {message: 'User deleted successfully'}
  }
}
