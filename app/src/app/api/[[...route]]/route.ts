import appRouter from "@/server"
import { createContext } from "@/server/jstack"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

const handler = (req: Request) =>
  fetchRequestHandler({
    router: appRouter,
    req,
    endpoint: "/api/trpc",
    createContext,
    onError(opts) {
      const { error } = opts

      if (error.code === "INTERNAL_SERVER_ERROR") {
        // send to bug reporting
        console.error("Something went wrong", error)
      }
    },
  })

export const GET = handler
export const POST = handler
