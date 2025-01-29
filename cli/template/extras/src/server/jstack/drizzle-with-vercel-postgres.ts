import { sql } from "@vercel/postgres"
import { drizzle } from "drizzle-orm/vercel-postgres"
import { jstack } from "jstack"

interface Env {
  Bindings: { POSTGRES_URL: string }
}

export const j = jstack.init<Env>()

/**
 * Type-safely injects database into all procedures
 * 
 * @see https://jstack.app/docs/backend/middleware
 */
const databaseMiddleware = j.middleware(async ({ next }) => {
  // automatically reads POSTGRES_URL environment variable
  const db = drizzle(sql)

  return await next({ db })
})

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure.use(databaseMiddleware)
