import { jstack } from "jstack"
import { drizzle } from "drizzle-orm/postgres-js"
import { env } from "hono/adapter"

interface Env {
  Bindings: { DATABASE_URL: string }
}

export const j = jstack.init<Env>()

/**
 * Type-safely injects database into all procedures
 * @see https://jstack.app/docs/backend/middleware
 * 
 * For deployment to Cloudflare Workers
 * @see https://developers.cloudflare.com/workers/tutorials/postgres/
 */
const databaseMiddleware = j.middleware(async ({ c, next }) => {
  const { DATABASE_URL } = env(c)

  const db = drizzle(DATABASE_URL)

  return await next({ db })
})

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure.use(databaseMiddleware)
