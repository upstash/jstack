import { Context } from "hono"
import { Middleware as TMiddleware } from "../types"

export class Middleware<T = {}> {
  private middleware: (params: {
    ctx: T
    next: <B>(args: B) => B & T
    c: Context
  }) => void | Promise<void>

  constructor(
    middleware: (params: {
      ctx: T
      next: <B>(args: B) => B & T
      c: Context
    }) => void | Promise<void>
  ) {
    this.middleware = middleware
  }

  public getMiddleware() {
    return this.middleware
  }

  public static create<T = {}>(middleware: TMiddleware<T>) {
    return new Middleware<T>(middleware as any)
  }
}
