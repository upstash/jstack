import { Hono } from "hono"
import { cors } from "hono/cors"
import { handle } from "hono/vercel"
import { productsRouter } from "./routers/products-router"

const app = new Hono().basePath("/api/hono").use(cors())
const appRouter = app
  .route("/products", productsRouter)

export const httpHandler = handle(app)


export default app
export type AppType = typeof appRouter
