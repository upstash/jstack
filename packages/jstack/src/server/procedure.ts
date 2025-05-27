import { Env } from "hono/types"
import { StatusCode } from "hono/utils/http-status"
import superjson from "superjson"
import type { ZodType as ZodV3Type } from "zod"
import type { ZodType as ZodV4Type } from "zod/v4"
import { IO } from "./io"
import {
  ContextWithSuperJSON,
  GetOperation,
  MiddlewareFunction,
  PostOperation,
  ResponseType,
  WebSocketHandler,
  WebSocketOperation,
  type InferZodType,
  type ZodAny,
} from "./types"

type OptionalPromise<T> = T | Promise<T>

export class Procedure<
  E extends Env = any,
  Ctx = {},
  InputSchema extends ZodAny | void = void,
  Incoming extends ZodAny | void = void,
  Outgoing extends ZodAny | void = void,
> {
  private readonly middlewares: MiddlewareFunction<Ctx, void, E>[] = []
  private readonly inputSchema?: InputSchema
  private readonly incomingSchema?: Incoming
  private readonly outgoingSchema?: Outgoing

  private superjsonMiddleware: MiddlewareFunction<Ctx, void, E> =
    async function superjsonMiddleware({ c, next }) {
      type JSONRespond = typeof c.json

      c.superjson = (<T>(data: T, status?: StatusCode): Response => {
        const serialized = superjson.stringify(data)

        return c.newResponse(serialized, status, {
          ...Object.fromEntries(c.res.headers.entries()),
          "x-is-superjson": "true",
        })
      }) as JSONRespond

      return next()
    }

  constructor(
    middlewares: MiddlewareFunction<Ctx, void, E>[] = [],
    inputSchema?: InputSchema,
    incomingSchema?: Incoming,
    outgoingSchema?: Outgoing,
  ) {
    this.middlewares = middlewares
    this.inputSchema = inputSchema
    this.incomingSchema = incomingSchema
    this.outgoingSchema = outgoingSchema

    if (!this.middlewares.some((mw) => mw.name === "superjsonMiddleware")) {
      this.middlewares.push(this.superjsonMiddleware)
    }
  }

  /**
   * Validates incoming WebSocket messages using a Zod schema.
   *
   * @see https://jstack.app/docs/backend/websockets
   * @param schema - A Zod schema to validate incoming WebSocket messages
   *
   * @example
   * ```ts
   * const chatValidator = z.object({
   *   message: z.object({
   *     roomId: z.string(),
   *     message: z.string(),
   *     author: z.string()
   *   })
   * })
   *
   * const chatRouter = router({
   *   chat: procedure
   *     .incoming(chatValidator)
   *     .ws(({ io }) => ({
   *       onConnect({ socket }) {
   *         socket.on("message", ({ roomId, message, author }) => {
   *           // ...
   *         })
   *       }
   *     }))
   * })
   * ```
   */
  incoming<Schema extends ZodAny>(schema: Schema) {
    return new Procedure<E, Ctx, InputSchema, Schema, Outgoing>(
      this.middlewares,
      this.inputSchema,
      schema,
      this.outgoingSchema,
    )
  }

  /**
   * Validates outgoing WebSocket messages using a Zod schema.
   *
   * @see https://jstack.app/docs/backend/websockets
   * @param schema - A Zod schema to validate outgoing WebSocket messages
   *
   * @example
   * ```ts
   * const chatValidator = z.object({
   *   message: z.object({
   *     roomId: z.string(),
   *     message: z.string(),
   *     author: z.string()
   *   })
   * })
   *
   * const chatRouter = router({
   *   chat: procedure
   *     .incoming(chatValidator)
   *     .outgoing(chatValidator)
   *     .ws(({ io }) => ({
   *       onConnect({ socket }) {
   *         socket.on("message", async (message) => {
   *           await io.to(message.roomId).emit("message", message)
   *         })
   *       }
   *     }))
   * })
   * ```
   */
  outgoing<Schema extends ZodAny>(schema: Schema) {
    return new Procedure<E, Ctx, InputSchema, Incoming, Schema>(
      this.middlewares,
      this.inputSchema,
      this.incomingSchema,
      schema,
    )
  }

  /**
   * Validates input parameters using a Zod schema.
   *
   * @see https://jstack.app/docs/backend/procedures#input-validation
   * @param schema - A Zod schema to validate input parameters
   *
   * @example
   * ```ts
   * const router = j.router({
   *   hello: publicProcedure
   *     .input(z.object({ name: z.string() }))
   *     .get(({ c, input }) => {
   *       return c.text(`Hello ${input.name}!`) // input is typed as { name: string }
   *     })
   * })
   * ```
   */
  input<Schema extends ZodAny>(schema: Schema) {
    return new Procedure<E, Ctx, Schema, Incoming, Outgoing>(
      this.middlewares,
      schema,
      this.incomingSchema,
      this.outgoingSchema,
    )
  }

  /**
   * Adds a middleware function to the procedure chain.
   *
   * @see https://jstack.app/docs/backend/middleware
   * @param handler - A middleware function that can modify the context
   *
   * @example
   * ```ts
   * // Create a middleware that adds user data to context
   * const withUser = j.middleware(async ({ ctx, next }) => {
   *   const user = await getUser()
   *   return await next({ user }) // Adds user to ctx
   * })
   *
   * const router = j.router({
   *   profile: publicProcedure
   *     .use(withUser) // Apply middleware
   *     .get(({ c, ctx }) => {
   *       return c.json(ctx.user) // ctx.user is now typed
   *     })
   * })
   * ```
   */
  use<T, Return = void>(
    handler: MiddlewareFunction<Ctx, Return, E>,
  ): Procedure<E, Ctx & T & Return, InputSchema, Incoming, Outgoing> {
    return new Procedure<E, Ctx & T & Return, InputSchema, Incoming, Outgoing>(
      [...this.middlewares, handler as any],
      this.inputSchema,
      this.incomingSchema,
      this.outgoingSchema,
    )
  }

  get<Return extends OptionalPromise<ResponseType<any>>>(
    handler: ({
      ctx,
      c,
      input,
    }: {
      ctx: Ctx
      c: ContextWithSuperJSON<E>
      input: InferZodType<InputSchema>
    }) => Return,
  ): GetOperation<InputSchema, ReturnType<typeof handler>, E> {
    return {
      type: "get",
      schema: this.inputSchema as
        | ZodV3Type<InputSchema>
        | ZodV4Type<InputSchema>
        | void,
      handler: handler as any,
      middlewares: this.middlewares,
    }
  }

  query<Return extends OptionalPromise<ResponseType<any>>>(
    handler: ({
      ctx,
      c,
      input,
    }: {
      ctx: Ctx
      c: ContextWithSuperJSON<E>
      input: InferZodType<InputSchema>
    }) => Return,
  ): GetOperation<InputSchema, Return, E> {
    return this.get(handler)
  }

  post<Return extends OptionalPromise<ResponseType<any>>>(
    handler: ({
      ctx,
      c,
      input,
    }: {
      ctx: Ctx
      c: ContextWithSuperJSON<E>
      input: InferZodType<InputSchema>
    }) => Return,
  ): PostOperation<InputSchema, ReturnType<typeof handler>, E> {
    return {
      type: "post",
      schema: this.inputSchema as
        | ZodV3Type<InputSchema>
        | ZodV4Type<InputSchema>
        | void,
      handler: handler as any,
      middlewares: this.middlewares,
    }
  }

  mutation<Return extends OptionalPromise<ResponseType<any>>>(
    handler: ({
      ctx,
      c,
      input,
    }: {
      ctx: Ctx
      c: ContextWithSuperJSON<E>
      input: InferZodType<InputSchema>
    }) => Return,
  ): PostOperation<InputSchema, Return, E> {
    return this.post(handler)
  }

  ws(
    handler: ({
      io,
      c,
      ctx,
    }: {
      io: IO<InferZodType<Incoming>, InferZodType<Outgoing>>
      c: ContextWithSuperJSON<E>
      ctx: Ctx
    }) => OptionalPromise<
      WebSocketHandler<InferZodType<Incoming>, InferZodType<Outgoing>>
    >,
  ): WebSocketOperation<InferZodType<Incoming>, InferZodType<Outgoing>, E> {
    return {
      type: "ws",
      outputFormat: "ws",
      handler: handler as any,
      middlewares: this.middlewares,
    }
  }
}
