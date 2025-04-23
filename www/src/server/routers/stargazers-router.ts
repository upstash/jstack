import { fetchStargazers } from "@/actions/stargazers"
import { j, publicProcedure } from "@/server/jstack"
import { Receiver } from "@upstash/qstash"
import { env } from "hono/adapter"

type StargazerInfo = Awaited<ReturnType<typeof fetchStargazers>>

export const stargazersRouter = j.router({
  /**
   * Background task to maintain real-time GitHub stargazer data in Redis
   *
   * This endpoint is automatically called by QStash every 10s to:
   * 1. Fetch the latest stargazer data from GitHub
   * 2. Store it in Redis for fast retrieval
   *
   * @internal This endpoint is meant to be called by QStash scheduler only
   */
  prefetch: publicProcedure.post(async ({ c, ctx }) => {
    const { redis } = ctx
    const {
      AMPLIFY_URL,
      QSTASH_CURRENT_SIGNING_KEY,
      QSTASH_NEXT_SIGNING_KEY,
      GITHUB_TOKEN,
    } = env(c)

    const ROUTER_URL = AMPLIFY_URL + "/api/stargazers/prefetch"

    const receiver = new Receiver({
      currentSigningKey: QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: QSTASH_NEXT_SIGNING_KEY,
    })

    const signature =
      c.req.header("Upstash-Signature") ||
      c.req.header("upstash-signature") ||
      ""
    const body = await c.req.raw.text().catch(() => "{}")

    try {
      await receiver.verify({
        body,
        signature,
        url: ROUTER_URL,
      })
    } catch (err) {
      return c.json(
        { success: false, message: "Invalid request signature" },
        401,
      )
    }

    const { stargazers, stargazerCount } = await fetchStargazers({
      GITHUB_TOKEN,
    })

    await redis.set("stargazer-info", { stargazerCount, stargazers })

    return c.json({ success: true })
  }),

  /**
   * This procedure fetches the most recent GitHub stargazers data from cache
   *
   * The data is served from Redis for performance,
   * updated every 5s by our background prefetch process.
   *
   * @returns {Promise<StargazerData>} List of recent stargazers with metadata
   */
  recent: publicProcedure.get(async ({ c, ctx }) => {
    const { redis } = ctx

    const stargazerInfo = await redis.get<StargazerInfo>("stargazer-info")

    return c.json(stargazerInfo)
  }),
})
