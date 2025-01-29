import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { Env, HTTPResponseError, MiddlewareHandler } from "hono/types"
import { ContentfulStatusCode } from "hono/utils/http-status"
import { ZodError } from "zod"
import { mergeRouters } from "./merge-routers"
import { Procedure } from "./procedure"
import { Router } from "./router"
import { MiddlewareFunction, OperationType } from "./types"

const router = <
  T extends Record<string, OperationType<any, any>>,
  E extends Env,
>(
  procedures: T = {} as T
): Router<T, E> => {
  return new Router(procedures)
}

/**
 * Adapts a Hono middleware to be compatible with the type-safe middleware format
 */
export function fromHono<E extends Env = any>(
  honoMiddleware: MiddlewareHandler<any>
): MiddlewareFunction<any, void, E> {
  return async ({ c, next }) => {
    await honoMiddleware(c, async () => {
      const result = await next()
      return result
    })
  }
}

class JStack {
  init<E extends Env = any>() {
    return {
      /**
       * Type-safe router factory function that creates a new router instance.
       * 
       * @template T - Record of operation types (queries/mutations/websockets)
       * @template E - Environment type for the router
       * @returns {Router<T, E>} A new router instance with type-safe procedure definitions
       * 
       * @example
       * const userRouter = router({
       *   getUser: publicProcedure
       *     .input(z.object({ id: z.string() }))
       *     .query(async ({ input }) => {
       *       return { id: input.id, name: "John Doe" }
       *     }),
       *   
       *   createUser: publicProcedure
       *     .input(z.object({ name: z.string() }))
       *     .mutation(async ({ input }) => {
       *       return { id: "123", name: input.name }
       *     })
       * })
       */
      router,
      mergeRouters,
      middleware: <T = {}, R = void>(
        middleware: MiddlewareFunction<T, R, E>
      ): MiddlewareFunction<T, R, E> => middleware,
      fromHono,
      procedure: new Procedure<E>(),
      defaults: {
        /**
         * CORS middleware configuration with default settings for API endpoints.
         *
         * @default
         * - Allows 'x-is-superjson' in headers
         * - Exposes 'x-is-superjson' in headers
         * - Accepts all origins
         * - Enables credentials
         */
        cors: cors({
          allowHeaders: ["x-is-superjson"],
          exposeHeaders: ["x-is-superjson"],
          origin: (origin) => origin,
          credentials: true,
        }),
        /**
         * Global error handler for API endpoints.
         * 
         * @example
         * // Client-side error handling
         * const { mutate } = useMutation({
         *   onError: (err: HTTPException) => {
         *     if (err.status === 401) {
         *       console.log(err.message) // Handle unauthorized
         *     }
         *   }
         * })
         */
        errorHandler: (err: Error | HTTPResponseError) => {
          console.error("[API Error]", err)

          if (err instanceof HTTPException) {
            return err.getResponse()
          } else if (err instanceof ZodError) {
            const httpError = new HTTPException(422, {
              message: "Validation error",
              cause: err,
            })

            return httpError.getResponse()
          } else if ("status" in err && typeof err.status === "number") {
            const httpError = new HTTPException(
              err.status as ContentfulStatusCode,
              {
                message: err.message || "API Error",
                cause: err,
              }
            )

            return httpError.getResponse()
          } else {
            const httpError = new HTTPException(500, {
              message:
                "An unexpected error occurred. Check server logs for details.",
              cause: err,
            })

            return httpError.getResponse()
          }
        },
      },
    }
  }
}

export const jstack = new JStack()
