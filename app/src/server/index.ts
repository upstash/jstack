import { j } from "./jstack"
import { postRouter } from "./routers/post-router"

/**
 * This is the main router for your server.
 * All routers in /server/routers should be added here manually.
 */
const appRouter = j.router({
  post: postRouter,
})

export type AppRouter = typeof appRouter

export default appRouter
