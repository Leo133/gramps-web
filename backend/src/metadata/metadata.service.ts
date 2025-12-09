import {Injectable} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class MetadataService {
  constructor(private prisma: PrismaService) {}

  async getMetadata() {
    const metadata = await this.prisma.metadata.findMany()
    const result: any = {}

    for (const item of metadata) {
      try {
        result[item.key] = JSON.parse(item.value)
      } catch {
        result[item.key] = item.value
      }
    }

    // Return default metadata if none exists
    if (Object.keys(result).length === 0) {
      return {
        version: '1.0.0',
        title: 'Gramps Web',
        allow_registration: true,
        server: {
          chat: true,
        },
        gramps_webapi: {
          version: '3.3.0',
        },
        database: {
          actual_schema: '1',
          schema: '1.0',
        },
        locale: {
          language: 'en',
        },
      }
    }

    return result
  }

  async setMetadata(key: string, value: any) {
    const jsonValue = JSON.stringify(value)

    await this.prisma.metadata.upsert({
      where: {key},
      create: {key, value: jsonValue},
      update: {value: jsonValue},
    })

    return {key, value}
  }
}
