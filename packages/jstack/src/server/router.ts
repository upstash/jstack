import { getCookie } from "hono/cookie"

import { Context, Hono, Next } from "hono"
import { env } from "hono/adapter"
import { HTTPException } from "hono/http-exception"
import { Env, ErrorHandler, MiddlewareHandler } from "hono/types"
import { StatusCode } from "hono/utils/http-status"
import { logger, ServerSocket } from "jstack-shared"
import { z } from "zod"
import { IO } from "./io"
import { bodyParsingMiddleware, queryParsingMiddleware } from "./middleware"
import {
  ContextWithSuperJSON,
  InferInput,
  MutationOperation,
  OperationType,
  QueryOperation,
  RouterConfig,
  WebSocketOperation,
} from "./types"
import { cors } from "hono/cors"

export type RouterSchema<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends WebSocketOperation<any, any>
    ? {
        $get: {
          input: InferInput<T[K]>
          output: {}
          incoming: NonNullable<T[K]["incoming"]>
          outgoing: NonNullable<T[K]["outgoing"]>
          outputFormat: "ws"
          status: StatusCode
        }
      }
    : T[K] extends QueryOperation<any, any>
      ? {
          $get: {
            input: InferInput<T[K]>
            output: ReturnType<T[K]["handler"]>
            outputFormat: "json"
            status: StatusCode
          }
        }
      : T[K] extends MutationOperation<any, any>
        ? {
            $post: {
              input: InferInput<T[K]>
              output: ReturnType<T[K]["handler"]>
              outputFormat: "json"
              status: StatusCode
            }
          }
        : never
}

interface InternalContext {
  __middleware_output?: Record<string, unknown>
  __parsed_query?: Record<string, unknown>
  __parsed_body?: Record<string, unknown>
}

export class Router<
  T extends Record<string, OperationType<any, any>> = {},
  E extends Env = any,
> extends Hono<E, RouterSchema<T>, any> {
  _metadata: {
    subRouters: Record<string, Router<any>>
    config: RouterConfig | Record<string, RouterConfig>
    procedures: Record<
      string,
      Record<string, { type: "query" | "mutation" | "ws" }>
    >
    registeredPaths: string[]
  }

  _errorHandler: undefined | ErrorHandler<any> = undefined

  config(config?: RouterConfig) {
    if (config) {
      this._metadata.config = config
    }

    return this
  }

  // Used in Hono adapters
  // Strips types to prevent version-mismatch induced infinite recursion warning
  get handler() {
    return this as Hono<any, any, any>
  }

  constructor(procedures: T = {} as T) {
    super()

    this._metadata = {
      subRouters: {},
      config: {},
      procedures: {},
      registeredPaths: [],
    }

    this.onError = (handler: ErrorHandler<any>) => {
      this._errorHandler = handler
      return this
    }

    this.setupRoutes(procedures)
  }

  private setupRoutes(procedures: Record<string, OperationType<any, any, E>>) {
    Object.entries(procedures).forEach(([key, operation]) => {
      const path = `/${key}` as const

      if (!this._metadata.procedures[key]) {
        this._metadata.procedures[key] = {
          type: operation.type as any,
        }
      }

      const operationMiddlewares: MiddlewareHandler<E>[] =
        operation.middlewares.map((middleware) => {
          const middlewareHandler = async (c: Context<E>, next: Next) => {
            const typedC = c as ContextWithSuperJSON<
              E & { Variables: InternalContext }
            >
            let middlewareOutput = typedC.get("__middleware_output") ?? {}

            const nextWrapper = async <B>(args: B) => {
              Object.assign(middlewareOutput, args)
              return middlewareOutput
            }

            const res = await middleware({
              ctx: middlewareOutput,
              next: nextWrapper,
              c: c as ContextWithSuperJSON<E>,
            })

            if (res) {
              Object.assign(middlewareOutput, res)
            }

            typedC.set("__middleware_output", middlewareOutput)
            await next()
          }

          return middlewareHandler
        })

      if (operation.type === "query") {
        if (operation.schema) {
          this.get(
            path,
            queryParsingMiddleware,
            ...operationMiddlewares,
            async (c) => {
              const typedC = c as Context<E & { Variables: InternalContext }>
              const ctx = typedC.get("__middleware_output") || {}
              const parsedQuery = typedC.get("__parsed_query")

              // caught at app-level with .onError
              const input = operation.schema?.parse(parsedQuery)
              const result = await operation.handler({
                c: c as ContextWithSuperJSON<E>,
                ctx,
                input,
              })
              return result === undefined ? c.json(undefined) : result
            }
          )
        } else {
          this.get(path, ...operationMiddlewares, async (c) => {
            const typedC = c as Context<E & { Variables: InternalContext }>
            const ctx = typedC.get("__middleware_output") || {}

            const result = await operation.handler({
              c: c as ContextWithSuperJSON<E>,
              ctx,
              input: undefined,
            })
            return result === undefined ? c.json(undefined) : result
          })
        }
      } else if (operation.type === "mutation") {
        if (operation.schema) {
          this.post(
            path,
            bodyParsingMiddleware,
            ...operationMiddlewares,
            async (c) => {
              const typedC = c as Context<E & { Variables: InternalContext }>
              const ctx = typedC.get("__middleware_output") || {}
              const parsedBody = typedC.get("__parsed_body")

              // caught at app-level with .onError
              const input = operation.schema?.parse(parsedBody)

              const result = await operation.handler({
                c: c as ContextWithSuperJSON<E>,
                ctx,
                input,
              })
              return result === undefined ? c.json(undefined) : result
            }
          )
        } else {
          this.post(path, ...operationMiddlewares, async (c) => {
            const typedC = c as Context<E & { Variables: InternalContext }>
            const ctx = typedC.get("__middleware_output") || {}

            const result = await operation.handler({
              c: c as ContextWithSuperJSON<E>,
              ctx,
              input: undefined,
            })
            return result === undefined ? c.json(undefined) : result
          })
        }
      } else if (operation.type === "ws") {
        this.get(
          path,
          queryParsingMiddleware,
          ...operationMiddlewares,
          async (c) => {
            const typedC = c as Context<
              E & {
                Variables: InternalContext
                Bindings: {
                  UPSTASH_REDIS_REST_URL: string | undefined
                  UPSTASH_REDIS_REST_TOKEN: string | undefined
                }
              }
            >

            const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } =
              env(typedC)

            if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
              throw new HTTPException(503, {
                message:
                  "Missing required environment variables for WebSockets connection.\n\n" +
                  "Real-time WebSockets depend on a persistent connection layer to maintain communication. JStack uses Upstash Redis to achieve this." +
                  "To fix this error:\n" +
                  "1. Log in to Upstash Redis at https://upstash.com\n" +
                  "2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your environment variables\n\n" +
                  "Complete WebSockets guide: https://jstack.app/docs/websockets\n",
              })
            }

            const ctx = typedC.get("__middleware_output") || {}

            const { 0: client, 1: server } = new WebSocketPair()

            server.accept()

            const io = new IO(UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN)

            const handler = await operation.handler({
              io,
              c: c as ContextWithSuperJSON<E>,
              ctx,
            })

            const socket = new ServerSocket(server, {
              redisUrl: UPSTASH_REDIS_REST_URL,
              redisToken: UPSTASH_REDIS_REST_TOKEN,
              incomingSchema: operation.incoming,
              outgoingSchema: operation.outgoing,
            })

            handler.onConnect?.({ socket })

            server.addEventListener("close", async () => {
              socket.close()
              await handler.onDisconnect?.({ socket })
            })

            server.addEventListener("error", async (error) => {
              socket.close()
              await handler.onError?.({ socket, error })
            })

            const eventSchema = z.tuple([z.string(), z.unknown()])

            server.addEventListener("message", async (event) => {
              try {
                const rawData = z.string().parse(event.data)
                const parsedData = JSON.parse(rawData)

                const [eventName, eventData] = eventSchema.parse(parsedData)

                if (eventName === "ping") {
                  server.send(JSON.stringify(["pong", null]))
                  return
                }

                socket.handleEvent(eventName, eventData)
              } catch (err) {
                logger.error("Failed to process message:", err)
              }
            })

            return new Response(null, {
              status: 101,
              webSocket: client,
            })
          }
        )
      }
    })
  }
}
