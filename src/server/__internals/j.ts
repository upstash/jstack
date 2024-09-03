import { Context } from "hono"
import { Procedure } from "./procedure"
import { Bindings } from "../env"

const baseProcedure = new Procedure()

type MiddlewareFunction<T = {}, R = void> = (params: {
  ctx: T
  next: <B>(args: B) => Promise<B & T>
  c: Context<{ Bindings: Bindings }>
}) => Promise<R>

/**
 * A helper to easily define middlewares and new procedures
 */

export const j = {
  middleware: <T = {}, R = void>(
    fn: MiddlewareFunction<T, R>
  ): MiddlewareFunction<T, R> => {
    return fn
  },
  procedure: baseProcedure,
}
