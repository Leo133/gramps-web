import {Injectable} from '@nestjs/common'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class TreeSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.treeSettings.findMany()
    const result: any = {}

    for (const item of settings) {
      try {
        result[item.key] = JSON.parse(item.value)
      } catch {
        result[item.key] = item.value
      }
    }

    // Return default settings if none exists
    if (Object.keys(result).length === 0) {
      return {
        min_role_ai: 0,
      }
    }

    return result
  }

  async updateSettings(data: any) {
    for (const [key, value] of Object.entries(data)) {
      const jsonValue = JSON.stringify(value)

      await this.prisma.treeSettings.upsert({
        where: {key},
        create: {key, value: jsonValue},
        update: {value: jsonValue},
      })
    }

    return this.getSettings()
  }
}
