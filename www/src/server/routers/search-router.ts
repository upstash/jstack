import { z } from "zod"
import { j, publicProcedure, vectorMiddleware } from "../jstack"
import { SearchMetadata } from "@/types"

export const searchRouter = j.router({
  byQuery: publicProcedure
    .use(vectorMiddleware)
    .input(z.object({ query: z.string().min(1).max(1000) }))
    .query(async ({ c, ctx, input }) => {
      const { index } = ctx
      const { query } = input

      const res = await index.query<SearchMetadata>({
        topK: 10,
        data: query,
        includeMetadata: true,
      })

      return c.superjson(res)
    }),
})
