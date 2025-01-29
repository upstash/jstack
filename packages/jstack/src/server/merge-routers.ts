import { Hono, Schema } from "hono"
import { Router, RouterSchema } from "./router"

type PrefixPaths<S extends Schema, Prefix extends string> = {
  [K in keyof S as `${Prefix}/${K & string}`]: S[K]
} extends infer O
  ? { [K in keyof O]: O[K] }
  : never

export type InferSchemaFromRouters<T extends Record<string, Hono<any, any, any> | Router<any>>> = {
  [K in keyof T]: T[K] extends Hono<any, infer S>
    ? PrefixPaths<S, K & string>
    : T[K] extends Router<infer P>
      ? PrefixPaths<RouterSchema<P>, K & string>
      : never
}[keyof T]

export function mergeRouters<R extends Record<string, Hono<any, any, any> | Router<any>>>(
  api: Hono<any, any, any>,
  routers: R
): Router<InferSchemaFromRouters<R>> {
  const mergedRouter = Object.create(Router.prototype)
  Object.assign(mergedRouter, api)

  mergedRouter._metadata = {
    subRouters: {},
    config: {},
    procedures: {},
    registeredPaths: [],
  }

  Object.entries(routers).forEach(([path, router]) => {
    const hasCustomErrorHandler = router instanceof Router && router._errorHandler !== undefined

    if (router instanceof Router) {
      Object.assign(mergedRouter._metadata.procedures, router._metadata.procedures)

      mergedRouter._metadata.config[path] = router._metadata.config
      mergedRouter._metadata.subRouters[path] = router
    }

    // propagate error to appRouter.onError()
    if (!hasCustomErrorHandler) {
      router.onError((err) => {
        throw err
      })
    }

    api.route(path, router)
  })

  return mergedRouter as Router<InferSchemaFromRouters<R>>
}
