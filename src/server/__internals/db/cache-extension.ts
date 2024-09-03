import { Prisma, PrismaClient } from "@prisma/client"
import { Redis } from "@upstash/redis/cloudflare"

export type CacheArgs = { cache?: { id: string; ttl?: number } }

/**
 * The Prisma extension to provide built-in caching with Upstash Redis
 */

export const cacheExtension = ({ redis }: { redis: Redis }) => {
  return Prisma.defineExtension({
    name: "prisma-extension-cache",
    model: {
      $allModels: {
        async findFirst<T, A>(
          this: T,
          args: Prisma.Args<T, "findFirst"> & CacheArgs
        ): Promise<Prisma.Result<T, A, "findFirst">> {
          const { cache: _cache, ...rest } = args
          const cache = _cache as CacheArgs["cache"]
          const ctx = Prisma.getExtensionContext(this)

          if (cache) {
            const cachedResult = await redis.get<
              Prisma.Result<T, A, "findFirst">
            >(cache.id)
            if (cachedResult) return cachedResult
          }

          const result = await (ctx as any).$parent[ctx.$name as any].findFirst(
            rest
          )

          if (cache && result) {
            if (cache.ttl) {
              await redis.set(cache.id, result, { ex: cache.ttl })
            } else {
              await redis.set(cache.id, result)
            }
          }

          return result
        },
        async findUnique<T, A>(
          this: T,
          args: Prisma.Args<T, "findUnique"> & CacheArgs
        ): Promise<Prisma.Result<T, A, "findUnique">> {
          const { cache: _cache, ...rest } = args
          const cache = _cache as CacheArgs["cache"]
          const ctx = Prisma.getExtensionContext(this)

          if (cache) {
            const cachedResult = await redis.get<
              Prisma.Result<T, A, "findUnique">
            >(cache.id)

            if (cachedResult) return cachedResult
          }

          const result = await (ctx as any).$parent[
            ctx.$name as any
          ].findUnique(rest)

          if (cache && result) {
            await redis.set(cache.id, result)
          }

          return result
        },
        async findMany<T, A>(
          this: T,
          args: Prisma.Args<T, "findMany"> & CacheArgs
        ): Promise<Prisma.Result<T, A, "findMany">> {
          const { cache: _cache, ...rest } = args
          const cache = _cache as CacheArgs["cache"]
          const ctx = Prisma.getExtensionContext(this)

          if (cache) {
            const cachedResult = await redis.get<
              Prisma.Result<T, A, "findMany">
            >(cache.id)

            if (cachedResult) return cachedResult
          }

          const result = await (ctx as any).$parent[
            ctx.$name as any
          ].findUnique(rest)

          if (cache && result) {
            await redis.set(cache.id, result)
          }

          return result
        },

        async create<T, A>(
          this: T,
          args: Prisma.Args<T, "create"> & CacheArgs
        ): Promise<Prisma.Result<T, A, "create">> {
          const { cache: _cache, ...rest } = args
          const cache = _cache as CacheArgs["cache"]
          const ctx = Prisma.getExtensionContext(this)

          if (cache) {
            await redis.del(cache.id)
          }

          const result = await (ctx as any).$parent[ctx.$name as any].create(
            rest
          )

          return result
        },

        async update<T, A>(
          this: T,
          args: Prisma.Args<T, "update"> & CacheArgs
        ): Promise<Prisma.Result<T, A, "update">> {
          const { cache: _cache, ...rest } = args
          const cache = _cache as CacheArgs["cache"]
          const ctx = Prisma.getExtensionContext(this)

          if (cache) {
            await redis.del(cache.id)
          }

          const result = await (ctx as any).$parent[ctx.$name as any].update(
            rest
          )

          return result
        },

        async delete<T, A>(
          this: T,
          args: Prisma.Args<T, "delete"> & CacheArgs
        ): Promise<Prisma.Result<T, A, "delete">> {
          const { cache: _cache, ...rest } = args
          const cache = _cache as CacheArgs["cache"]
          const ctx = Prisma.getExtensionContext(this)

          if (cache) {
            await redis.del(cache.id)
          }

          const result = await (ctx as any).$parent[ctx.$name as any].delete(
            rest
          )

          return result
        },
      },
    },
  })
}

type Extension = ReturnType<typeof cacheExtension>
export type ExtendedPrismaClient = PrismaClient &
  Omit<Extension, "$extends" | "name" | "model" | "query">
