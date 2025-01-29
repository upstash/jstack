import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { env } from "hono/adapter"
import { jstack } from "jstack"

interface Env {
  Bindings: { DATABASE_URL: string }
}

export const j = jstack.init<Env>()

/**
 * Injects database instance into all procedures
 *
 * @example
 * ```ts
 * publicProcedure.query(({ ctx }) => {
 *   const { db } = ctx
 *   return db.select().from(users)
 * })
 * ```
 */
export const databaseMiddleware = j.middleware(async ({ c, next }) => {
  const { DATABASE_URL } = env(c)

  const sql = neon(DATABASE_URL)
  const db = drizzle(sql)

  return await next({ db })
})

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure.use(databaseMiddleware)
