/**
 * Define your environment variables here
 * 
 * Access these in your API (fully type-safe):
 * @see https://hono.dev/docs/helpers/adapter#env
 */

export type Bindings = {
  DATABASE_URL: string
  REDIS_URL: string
  REDIS_TOKEN: string
}
