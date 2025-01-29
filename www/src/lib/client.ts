import type { AppRouter } from "@/server"
import { createClient } from "jstack"

export const client = createClient<AppRouter>({
  baseUrl: `${getBaseUrl()}/api`,
})

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.NODE_ENV === "production") return `https://${process.env.AMPLIFY_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}
