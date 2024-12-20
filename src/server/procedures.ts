import { Pool } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"
import { Redis } from "@upstash/redis/cloudflare"
import { env } from "hono/adapter"
import { cacheExtension } from "./__internals/db/cache-extension"
import { j } from "./__internals/j"
import { currentUser } from "../features/auth/lib/auth"
import { db } from "../db"
import { HTTPException } from "hono/http-exception"
import { auth } from "@/auth"

/**
 * Middleware for providing a built-in cache with your Prisma database.
 *
 * You can remove this if you don't like it, but caching can massively speed up your database queries.
 */
export const dynamic = "force-dynamic"


export const baseProcedure = j.procedure
export const publicProcedure = baseProcedure
