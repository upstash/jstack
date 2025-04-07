import { Hono } from "hono"
import { Router } from "./router"

export type InferSchemaFromRouters<
  R extends Record<string, Router<any> | (() => Promise<Router<any>>)>,
> = {
  [P in keyof R]: R[P] extends () => Promise<Router<any>>
    ? R[P] extends () => Promise<infer T>
      ? T extends Hono<any, infer S>
        ? { [Q in keyof S]: S[Q] }
        : never
      : never
    : R[P] extends Hono<any, infer S>
      ? { [Q in keyof S]: S[Q] }
      : never
}

export function mergeRouters<
  R extends Record<string, Router<any> | (() => Promise<Router<any>>)>,
>(api: Hono<any, any, any>, routers: R): Router<InferSchemaFromRouters<R>> {
  const mergedRouter = new Router()
  Object.assign(mergedRouter, api)

  mergedRouter._metadata = {
    subRouters: {},
    config: {},
    procedures: {},
    registeredPaths: [],
  }

  for (const [key, router] of Object.entries(routers)) {
    // lazy-loaded routers using `dynamic()` use proxy to avoid loading bundle initially
    if (typeof router === "function") {
      const proxyRouter = new Router()

      proxyRouter.all("*", async (c) => {
        const actualRouter = await router()
        mergedRouter._metadata.subRouters[`/api/${key}`] = actualRouter

        return actualRouter.fetch(c.req.raw, c.env)
      })
      mergedRouter._metadata.subRouters[`/api/${key}`] = proxyRouter
    } else if (router instanceof Router) {
      // statically imported routers can be assigned directly
      mergedRouter._metadata.subRouters[`/api/${key}`] = router
    }
  }

  mergedRouter.registerSubrouterMiddleware()

  return mergedRouter as Router<InferSchemaFromRouters<R>>
}
