import { Hono, Schema } from "hono"
import { Router, RouterSchema } from "./router"

type PrefixPaths<S extends Schema, Prefix extends string> = {
  [K in keyof S as `${Prefix}/${K & string}`]: S[K]
} extends infer O
  ? { [K in keyof O]: O[K] }
  : never

export type InferSchemaFromRouters<
  T extends Record<string, Hono<any, any, any> | (() => Promise<Router<any>>)>,
> = {
  [K in keyof T]: T[K] extends Hono<any, infer S>
    ? PrefixPaths<S, K & string>
    : T[K] extends () => Promise<Router<infer P>>
      ? PrefixPaths<RouterSchema<P>, K & string>
      : never
}[keyof T]

// export type ResolvedRouter<
//   T extends Record<string, Hono<any, any, any> | (() => Promise<Router<any>>)>,
// > = Router<InferSchemaFromRouters<T>> & {
//   __resolvedType?: InferSchemaFromRouters<T>
// }

export function mergeRouters<
  R extends Record<string, Hono<any, any, any> | (() => Promise<Router<any>>)>,
>(api: Hono<any, any, any>, routers: R): Router<InferSchemaFromRouters<R>>  {
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
