import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { initTRPC } from "@trpc/server"
import superjson from "superjson"
import { env } from "hono/adapter"
import { Context } from "hono"

export type HonoContext = {
  env: Context["env"]
}

export const j = initTRPC.context<HonoContext>().create({
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
  const { DATABASE_URL } = env(ctx.env)

  const sql = neon(DATABASE_URL)
  const db = drizzle(sql)

  return await next({ ctx: { db } })
})

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure.use(databaseMiddleware)
