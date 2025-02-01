import type { AppRouter } from "@/server"
import { createTRPCClient } from "@trpc/client"
import { httpLink } from "@trpc/client"
import superjson from "superjson"

/**
 * Your type-safe API client
 * @see https://jstack.app/docs/backend/api-client
 */
export const client = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: "http://localhost:3000/api/trpc",
      transformer: superjson,
    }),
  ],
})
