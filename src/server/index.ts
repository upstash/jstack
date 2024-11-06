import { Hono } from "hono"
import { cors } from "hono/cors"
import { handle } from "hono/vercel"
import { postRouter } from "./routers/post-router"
import { authRouter } from "./routers/auth-router"

const app = new Hono().basePath("/api").use(cors())

const appRouter = app.route("/auth", authRouter)

// The handler Next.js uses to answer API requests
export const httpHandler = handle(app)

export default app

// export type definition of API
export type AppType = typeof appRouter
