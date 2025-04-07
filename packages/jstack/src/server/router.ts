import { Context, Hono, Next } from "hono"
import { env } from "hono/adapter"
import { HTTPException } from "hono/http-exception"
import { Env, ErrorHandler, Handler, MiddlewareHandler } from "hono/types"
import { StatusCode } from "hono/utils/http-status"
import { logger, ServerSocket } from "jstack-shared"
import { z } from "zod"
import { IO } from "./io"
import { bodyParsingMiddleware, queryParsingMiddleware } from "./middleware"
import {
  ContextWithSuperJSON,
  GetOperation,
  InferInput,
  OperationType,
  PostOperation,
  RouterConfig,
  WebSocketOperation,
} from "./types"

type FlattenRoutes<T> = {
  [K in keyof T]: T[K] extends WebSocketOperation<any, any>
    ? { [P in `${string & K}`]: T[K] }
    : T[K] extends GetOperation<any, any>
      ? { [P in `${string & K}`]: T[K] }
      : T[K] extends PostOperation<any, any>
        ? { [P in `${string & K}`]: T[K] }
        : T[K] extends Record<string, any>
          ? {
              [SubKey in keyof T[K] as `${string & K}/${string & SubKey}`]: T[K][SubKey] extends
                | WebSocketOperation<any, any>
                | GetOperation<any, any>
                | PostOperation<any, any>
                ? T[K][SubKey]
                : never
            }
          : never
}[keyof T]

export type MergeRoutes<T> = {
  [K in keyof FlattenRoutes<T>]: FlattenRoutes<T>[K]
}

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
  : T[K] extends GetOperation<any, any>
  ? {
    $get: {
      input: InferInput<T[K]>
      output: ReturnType<T[K]["handler"]>
      outputFormat: "json"
      status: StatusCode
    }
  }
  : T[K] extends PostOperation<any, any>
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

export type OperationSchema<T> =
  T extends WebSocketOperation<any, any>
    ? {
        $get: {
          input: InferInput<T>
          output: {}
          incoming: NonNullable<T["incoming"]>
          outgoing: NonNullable<T["outgoing"]>
          outputFormat: "ws"
          status: StatusCode
        }
      }
    : T extends GetOperation<any, any>
      ? {
          $get: {
            input: InferInput<T>
            output: ReturnType<T["handler"]>
            outputFormat: "json"
            status: StatusCode
          }
        }
      : T extends PostOperation<any, any>
        ? {
            $post: {
              input: InferInput<T>
              output: ReturnType<T["handler"]>
              outputFormat: "json"
              status: StatusCode
            }
          }
        : never

interface InternalContext {
  __middleware_output?: Record<string, unknown>
  __parsed_query?: Record<string, unknown>
  __parsed_body?: Record<string, unknown>
}

export class Router<
  T extends Record<string, OperationType<any, any> | Record<string, any>> = {},
  E extends Env = any,
> extends Hono<E, RouterSchema<MergeRoutes<T>>, any> {
  _metadata: {
    subRouters: Record<string, Promise<Router<any>> | Router<any>>
    config: RouterConfig | Record<string, RouterConfig>
    procedures: Record<string, Record<string, { type: "get" | "post" | "ws" }>>
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
    return this as any
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

  registerSubrouterMiddleware() {
    this.use(async (c, next) => {
      const [basePath, routerName] = c.req.path
        .split("/")
        .filter(Boolean)
        .slice(0, 2)

      const key = `/${basePath}/${routerName}`
      const subRouter = await this._metadata.subRouters[key]

      if (subRouter) {
        const rewrittenPath = "/" + c.req.path.split("/").slice(3).join("/")
        const newUrl = new URL(c.req.url)
        newUrl.pathname = rewrittenPath

        const newRequest = new Request(newUrl, c.req.raw)
        const response = await subRouter.fetch(newRequest, c.env)

        return response
      }

      return next()
    })
  }

  private setupRoutes(procedures: Record<string, any>) {
    Object.entries(procedures).forEach(([key, value]) => {
      if (this.isOperationType(value)) {
        this.registerOperation(key, value)
      } else if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (this.isOperationType(subValue)) {
            this.registerOperation(`${key}/${subKey}`, subValue)
          }
        })
      }
    })
  }

  private isOperationType(value: any): value is OperationType<any, any, any> {
    return (
      value &&
      typeof value === "object" &&
      "type" in value &&
      (value.type === "get" || value.type === "post" || value.type === "ws")
    )
  }

  private registerOperation(
    path: string,
    operation: OperationType<any, any, E>,
  ) {
    const routePath = `/${path}` as const

    if (!this._metadata.procedures[path]) {
      this._metadata.procedures[path] = {
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

    if (operation.type === "get") {
      if (operation.schema) {
        this.get(
          routePath,
          queryParsingMiddleware,
          ...operationMiddlewares,
          async (c) => {
            const typedC = c as Context<E & { Variables: InternalContext }>
            const ctx = typedC.get("__middleware_output") || {}
            const parsedQuery = typedC.get("__parsed_query")

            const queryInput =
              Object.keys(parsedQuery || {}).length === 0
                ? undefined
                : parsedQuery

            // caught at app-level with .onError
            const input = operation.schema?.parse(queryInput)
            const result = await operation.handler({
              c: c as ContextWithSuperJSON<E>,
              ctx,
              input,
            })

            return result === undefined ? c.json(undefined) : result
          },
        )
      } else {
        this.get(routePath, ...operationMiddlewares, async (c) => {
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
    } else if (operation.type === "post") {
      if (operation.schema) {
        this.post(
          routePath,
          bodyParsingMiddleware,
          ...operationMiddlewares,
          async (c) => {
            const typedC = c as Context<E & { Variables: InternalContext }>
            const ctx = typedC.get("__middleware_output") || {}
            const parsedBody = typedC.get("__parsed_body")

            const bodyInput =
              Object.keys(parsedBody || {}).length === 0
                ? undefined
                : parsedBody

            // caught at app-level with .onError
            const input = operation.schema?.parse(bodyInput)

            const result = await operation.handler({
              c: c as ContextWithSuperJSON<E>,
              ctx,
              input,
            })

            return result === undefined ? c.json(undefined) : result
          },
        )
      } else {
        this.post(routePath, ...operationMiddlewares, async (c) => {
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
        routePath,
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

            server.onclose = async () => {
              socket.close()
              await handler.onDisconnect?.({ socket })
            }

            server.onerror = async (error) => {
              socket.close()
              await handler.onError?.({ socket, error })
            }

            const eventSchema = z.tuple([z.string(), z.unknown()])
            server.onmessage = async (event) => {
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
            }

          return new Response(null, {
            status: 101,
            webSocket: client,
          })
        },
      )
    }
  }
}
