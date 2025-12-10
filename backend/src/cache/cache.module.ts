import {Module, Global} from '@nestjs/common'
import {CacheModule as NestCacheModule} from '@nestjs/cache-manager'
import {ConfigModule, ConfigService} from '@nestjs/config'
import * as redisStore from 'cache-manager-redis-store'
import {CacheService} from './cache.service'

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL')

        // If Redis is configured, use it; otherwise, use in-memory cache
        if (redisUrl) {
          return {
            store: redisStore as any,
            url: redisUrl,
            ttl: 300, // Default TTL: 5 minutes
            max: 100, // Max items in cache
          }
        }

        // Fallback to in-memory cache
        return {
          ttl: 300,
          max: 100,
        }
      },
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule, CacheService],
})
export class CacheModule {}
