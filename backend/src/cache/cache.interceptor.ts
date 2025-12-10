import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common'
import {Observable, of} from 'rxjs'
import {tap} from 'rxjs/operators'
import {CACHE_MANAGER} from '@nestjs/cache-manager'
import {Cache} from 'cache-manager'
import {Reflector} from '@nestjs/core'
import {CACHE_TTL_KEY, CACHE_KEY_PREFIX} from './cache.decorators'

/**
 * HTTP Cache Interceptor
 * Caches GET requests based on URL and query parameters
 * Phase 11: Performance optimization
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest()

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle()
    }

    // Get custom TTL from decorator or use default
    const ttl =
      this.reflector.get<number>(CACHE_TTL_KEY, context.getHandler()) || 300

    // Get custom key prefix from decorator
    const keyPrefix =
      this.reflector.get<string>(CACHE_KEY_PREFIX, context.getHandler()) || ''

    // Generate cache key from request URL and query params
    const cacheKey = this.generateCacheKey(request, keyPrefix)

    // Try to get cached response
    const cachedResponse = await this.cacheManager.get(cacheKey)

    if (cachedResponse) {
      return of(cachedResponse)
    }

    // If not cached, execute handler and cache the result
    return next.handle().pipe(
      tap(async response => {
        await this.cacheManager.set(cacheKey, response, ttl)
      }),
    )
  }

  private generateCacheKey(request: any, prefix: string): string {
    const url = request.url
    const queryString = JSON.stringify(request.query)
    return `${prefix}:${url}:${queryString}`
  }
}
