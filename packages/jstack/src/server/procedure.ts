import { Env, MiddlewareHandler } from "hono/types"
import { StatusCode } from "hono/utils/http-status"
import superjson from "superjson"
import { z, ZodTypeAny } from "zod"
import { IO } from "./io"
import {
  ContextWithSuperJSON,
  MiddlewareFunction,
  MutationOperation,
  QueryOperation,
  ResponseType,
  WebSocketHandler,
  WebSocketOperation,
} from "./types"

type OptionalPromise<T> = T | Promise<T>
type InferIncomingData<Events> = Events extends ZodTypeAny
  ? z.infer<Events>
  : void


export class Procedure<
  E extends Env = any,
  Ctx = {},
  InputSchema extends ZodTypeAny | void = void,
  Incoming extends ZodTypeAny | void = void,
  Outgoing extends ZodTypeAny | void = void,
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
    outgoingSchema?: Outgoing
  ) {
    this.middlewares = middlewares
    this.inputSchema = inputSchema
    this.incomingSchema = incomingSchema
    this.outgoingSchema = outgoingSchema

    if (!this.middlewares.some((mw) => mw.name === "superjsonMiddleware")) {
      this.middlewares.push(this.superjsonMiddleware)
    }
  }

  incoming<Schema extends z.ZodTypeAny>(schema: Schema) {
    return new Procedure<E, Ctx, InputSchema, Schema, Outgoing>(
      this.middlewares,
      this.inputSchema,
      schema,
      this.outgoingSchema
    )
  }

  outgoing<Schema extends z.ZodTypeAny>(schema: Schema) {
    return new Procedure<E, Ctx, InputSchema, Incoming, Schema>(
      this.middlewares,
      this.inputSchema,
      this.incomingSchema,
      schema
    )
  }

  input<Schema extends z.ZodTypeAny>(schema: Schema) {
    return new Procedure<E, Ctx, Schema, Incoming, Outgoing>(
      this.middlewares,
      schema,
      this.incomingSchema,
      this.outgoingSchema
    )
  }

  use<T, Return = void>(
    handler: MiddlewareFunction<Ctx, Return, E>
  ): Procedure<E, Ctx & T & Return, InputSchema, Incoming, Outgoing> {
    return new Procedure<E, Ctx & T & Return, InputSchema, Incoming, Outgoing>(
      [...this.middlewares, handler as any],
      this.inputSchema,
      this.incomingSchema,
      this.outgoingSchema
    )
  }

  query<Return extends OptionalPromise<ResponseType<any>>>(
    handler: ({
      ctx,
      c,
      input,
    }: {
      ctx: Ctx
      c: ContextWithSuperJSON<E>
      input: InputSchema extends ZodTypeAny ? z.infer<InputSchema> : void
    }) => Return
  ): QueryOperation<InputSchema, ReturnType<typeof handler>, E> {
    return {
      type: "query",
      schema: this.inputSchema,
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
      input: InputSchema extends ZodTypeAny ? z.infer<InputSchema> : void
    }) => Return
  ): MutationOperation<InputSchema, ReturnType<typeof handler>, E> {
    return {
      type: "mutation",
      schema: this.inputSchema,
      handler: handler as any,
      middlewares: this.middlewares,
    }
  }

  ws(
    handler: ({
      io,
      c,
      ctx,
    }: {
      io: IO<InferIncomingData<Incoming>, InferIncomingData<Outgoing>>
      c: ContextWithSuperJSON<E>
      ctx: Ctx
    }) => OptionalPromise<
      WebSocketHandler<InferIncomingData<Incoming>, InferIncomingData<Outgoing>>
    >
  ): WebSocketOperation<
    InferIncomingData<Incoming>,
    InferIncomingData<Outgoing>,
    E
  > {
    return {
      type: "ws",
      outputFormat: "ws",
      handler: handler as any,
      middlewares: this.middlewares,
    }
  }
}
