/**
 * Internal middlewares
 * Do not modify unless you know what you're doing
 */

import { MiddlewareHandler } from "hono"
import { parseSuperJSON } from "./utils"

/**
 * Middleware to parse GET-request using SuperJSON
 */
export const queryParsingMiddleware: MiddlewareHandler =
  async function queryParsingMiddleware(c, next) {
    const rawQuery = c.req.query()
    const parsedQuery: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(rawQuery)) {
      parsedQuery[key] = parseSuperJSON(value)
    }

    c.set("__parsed_query", parsedQuery)
    await next()
  }

/**
 * Middleware to parse POST-requests using SuperJSON
 */
export const bodyParsingMiddleware: MiddlewareHandler =
  async function bodyParsingMiddleware(c, next) {
    const rawBody = await c.req.json()
    const parsedBody: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(rawBody)) {
      parsedBody[key] = parseSuperJSON(value as any)
    }

    c.set("__parsed_body", parsedBody)
    await next()
  }
