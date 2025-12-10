import {Injectable, Inject} from '@nestjs/common'
import {CACHE_MANAGER} from '@nestjs/cache-manager'
import {Cache} from 'cache-manager'

/**
 * Cache service for managing cache operations
 * Phase 11: Redis caching strategy
 */
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key)
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl)
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key)
  }

  /**
   * Clear entire cache
   */
  async reset(): Promise<void> {
    await this.cacheManager.reset()
  }

  /**
   * Invalidate cache by pattern (prefix)
   * Note: This requires Redis store with custom implementation
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    // For in-memory cache or simple stores, we'll reset entire cache
    // In production with Redis, this could use SCAN and DEL commands
    await this.reset()
  }

  /**
   * Get or set pattern: fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    let value = await this.get<T>(key)

    if (value === undefined || value === null) {
      value = await factory()
      await this.set(key, value, ttl)
    }

    return value
  }
}
