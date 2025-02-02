import { neon } from "@neondatabase/serverless"
import { initTRPC } from "@trpc/server"
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"
import { drizzle } from "drizzle-orm/neon-http"
import superjson from "superjson"

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {}
}

export type Context = Awaited<ReturnType<typeof createContext>>

export const j = initTRPC.context<Context>().create({
  transformer: superjson,
})

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
export const databaseMiddleware = j.middleware(async ({ next, ctx }) => {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql)

  return await next({ ctx: { db } })
})

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure.use(databaseMiddleware)
