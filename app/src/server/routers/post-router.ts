import { z } from "zod"
import { j } from "../jstack"

interface Post {
  id: number
  name: string
}

// Mocked DB
const posts: Post[] = [
  {
    id: 1,
    name: "Hello World",
  },
]

/**
 * This is a router that defines multiple procedures (`recent`, `create`)
 * Under the hood, each procedure is its own HTTP endpoint
 *
 * @see https://jstack.app/docs/backend/routers
 */
export const postRouter = j.router({
  recent: j.procedure.query(({ c }) => {
    return c.superjson(posts.at(-1) ?? null)
  }),

  create: j.procedure
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
