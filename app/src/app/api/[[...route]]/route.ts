import appRouter from "@/server"
import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { handle } from "hono/vercel"

const app = new Hono()

app.use(
  cors({
    origin: (origin) => origin,
    credentials: true,
  })
)

const server = trpcServer({
  endpoint: "/api/trpc",
  router: appRouter,
  onError(opts) {
    console.error(opts.error)
  },
})

app.use("*", server)

// This route catches all incoming API requests and lets your appRouter handle them.
export const GET = handle(app)
export const POST = handle(app)
