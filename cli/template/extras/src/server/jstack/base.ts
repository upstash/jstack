import { jstack } from "jstack"

interface Env {
  Bindings: {}
}

export const j = jstack.init<Env>()

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure
