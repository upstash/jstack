import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { publicProcedure } from "../procedures"
import { router } from "../__internals/router"
import { env } from "hono/adapter"

export const postRouter = router({
  recent: publicProcedure.query(async ({ c, ctx }) => {
    const { db } = ctx

    const recentPost = await db.post.findFirst({
      orderBy: { createdAt: "desc" },
      cache: { id: "recent-post" },
    })

    if (!recentPost) {
      throw new HTTPException(404, {
        message: "No post found",
      })
    }

    return c.superjson(recentPost)
  }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, c, input }) => {
      const { name } = input
      const { db } = ctx

      const post = await db.post.create({
        data: { name },
        cache: { id: "recent-post" },
      })

      return c.superjson({ ...post })
    }),
})
