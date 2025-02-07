import { Context, TypedResponse } from "hono"
import type superjson from "superjson"
import { z } from "zod"

import { Env, Input } from "hono/types"
import { StatusCode } from "hono/utils/http-status"
import { ServerSocket } from "jstack-shared"
import { IO } from "./io"

type SuperJSONParsedType<T> = ReturnType<typeof superjson.parse<T>>

export type SuperJSONTypedResponse<
  T,
  U extends StatusCode = StatusCode,
> = TypedResponse<SuperJSONParsedType<T>, U, "json">

export interface RouterConfig {
  name?: string
}

export type SuperJSONHandler = {
  superjson: <T>(data: T, status?: number) => SuperJSONTypedResponse<T>
}

export type ContextWithSuperJSON<
  E extends Env = any,
  P extends string = any,
  I extends Input = {},
> = Context<E, P, I> & SuperJSONHandler

export type InferMiddlewareOutput<T> =
  T extends MiddlewareFunction<any, infer R, any> ? R : unknown

export type MiddlewareFunction<
  T = {},
  R = void,
  E extends Env = any,
> = (params: {
  ctx: T
  next: <B>(args?: B) => Promise<B & T>
  c: ContextWithSuperJSON<E>
}) => Promise<R>

export type EmitFunction = (event: string, data?: any) => Promise<void>
export type RoomEmitFunction = (room: string, data?: any) => Promise<void>

export type WebSocketHandler<IncomingSchema, OutgoingSchema> = {
  onConnect?: ({
    socket,
  }: {
    socket: ServerSocket<IncomingSchema, OutgoingSchema>
  }) => any
  onDisconnect?: ({
    socket,
  }: {
    socket: ServerSocket<IncomingSchema, OutgoingSchema>
  }) => any
  onError?: ({
    socket,
    error,
  }: {
    socket: ServerSocket<IncomingSchema, OutgoingSchema>
    error: Event
  }) => any
}

export type WebSocketOperation<
  // FIXME: Record<string,unknown> type error
  IncomingSchema extends Record<string, any>,
  OutgoingSchema extends Record<string, any>,
  E extends Env = any,
> = {
  type: "ws"
  incoming?: IncomingSchema
  outgoing?: OutgoingSchema
  outputFormat: "ws"
  handler: <Input>({
    io,
    c,
    ctx,
  }: {
    io: IO<IncomingSchema, OutgoingSchema>
    c: ContextWithSuperJSON<E>
    ctx: Input
  }) => OptionalPromise<WebSocketHandler<IncomingSchema, OutgoingSchema>>
  middlewares: MiddlewareFunction<any, any, E>[]
}

export type ResponseType<Output> =
  | SuperJSONTypedResponse<Output>
  | TypedResponse<Output, StatusCode, "text">
  | Response
  | void

type UnwrapResponse<T> =
  Awaited<T> extends TypedResponse<infer U>
    ? U
    : Awaited<T> extends SuperJSONTypedResponse<infer U>
      ? U
      : Awaited<T> extends Response
        ? any
        : Awaited<T> extends void
          ? void
          : T

export type GetOperation<
  Schema extends Record<string, any> | void,
  Return = OptionalPromise<ResponseType<any>>,
  E extends Env = any,
> = {
  type: "get"
  schema?: z.ZodType<Schema> | void
  handler: <Input>({
    c,
    ctx,
    input,
  }: {
    ctx: Input
    c: ContextWithSuperJSON<E>
    input: Schema extends Record<string, any> ? Schema : void
  }) => UnwrapResponse<OptionalPromise<Return>>
  middlewares: MiddlewareFunction<any, any, E>[]
}

type OptionalPromise<T> = T | Promise<T>

export type PostOperation<
  Schema extends Record<string, any> | void,
  Return = OptionalPromise<ResponseType<any>>,
  E extends Env = any,
> = {
  type: "post"
  schema?: z.ZodType<Schema> | void
  handler: <Input, Output>({
    ctx,
    c,
  }: {
    ctx: Input
    c: ContextWithSuperJSON<E>
    input: Schema extends Record<string, any> ? Schema : void
  }) => UnwrapResponse<OptionalPromise<Return>>
  middlewares: MiddlewareFunction<any, any, E>[]
}

export type OperationType<
  I extends Record<string, any>,
  O extends Record<string, unknown>,
  E extends Env = any,
> =
  | GetOperation<I, O, E>
  | PostOperation<I, O, E>
  | WebSocketOperation<I, O, E>

export type InferInput<T> =
  T extends OperationType<infer I, any>
    ? I extends z.ZodTypeAny
      ? z.infer<I>
      : I
    : void
