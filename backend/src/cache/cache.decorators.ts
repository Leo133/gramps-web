import {SetMetadata} from '@nestjs/common'

export const CACHE_TTL_KEY = 'cache_ttl'
export const CACHE_KEY_PREFIX = 'cache_key_prefix'

/**
 * Decorator to set custom cache TTL (in seconds)
 * @param ttl Time to live in seconds
 */
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_KEY, ttl)

/**
 * Decorator to set custom cache key prefix
 * @param prefix Cache key prefix
 */
export const CacheKeyPrefix = (prefix: string) =>
  SetMetadata(CACHE_KEY_PREFIX, prefix)
