import { j } from "./procedures"
import { stargazersRouter } from "./routers/stargazers-router"

export const api = j
  .router()
  .basePath("/api")
  .use(j.defaults.cors)
  .onError(j.defaults.errorHandler)

const appRouter = j.mergeRouters(api, {
  stargazers: stargazersRouter,
})

export type AppRouter = typeof appRouter
export default appRouter
