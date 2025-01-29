import { z } from "zod"
import { j, publicProcedure } from "../jstack"

// Mocked DB
interface Post {
  id: number
  name: string
}

const posts: Post[] = [
  {
    id: 1,
    name: "Hello World",
  },
]

export const postRouter = j.router({
  recent: publicProcedure.query(({ c }) => {
    return c.superjson(posts.at(-1) ?? null)
  }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ c, input }) => {
      const post: Post = {
        id: posts.length + 1,
        name: input.name,
      }

      posts.push(post)

      return c.superjson(post)
    }),
})
