import { AppType } from "@/server"
import { hc } from "hono/client"
import { HTTPException } from "hono/http-exception"
import { StatusCode } from "hono/utils/http-status"
import superjson from "superjson"

const getBaseUrl = () => {
  // browser should use relative path
  if (typeof window !== "undefined") {
    return ""
  }

  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_APP_URL!
  }

  // if deployed to vercel, use vercel url
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // assume deployment to cloudflare workers otherwise, you'll get this URL after running
  // `npm run deploy`, which deploys your server to cloudflare
  return "https://<YOUR_DEPLOYED_WORKER_URL>/"
}

export const baseClient = hc<AppType>(getBaseUrl(), {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await fetch(input, { ...init, cache: "no-store" })

    if (!response.ok) {
      throw new HTTPException(response.status as StatusCode, {
        message: response.statusText,
        res: response,
      })
    }

    const contentType = response.headers.get("Content-Type")

    response.json = async () => {
      const text = await response.text()

      if (contentType === "application/superjson") {
        return superjson.parse(text)
      }

      try {
        return JSON.parse(text)
      } catch (error) {
        console.error("Failed to parse response as JSON:", error)
        throw new Error("Invalid JSON response")
      }
    }

    return response
  },
})["api"]

function getHandler(obj: Object, ...keys: string[]) {
  let current = obj
  for (const key of keys) {
    current = current[key as keyof typeof current]
  }
  return current as Function
}

function serializeWithSuperJSON(data: any): any {
  if (typeof data !== "object" || data === null) {
    return data
  }
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      superjson.stringify(value),
    ])
  )
}

/**
 * This is an optional convenience proxy to pass data directly to your API
 * instead of using nested objects as hono does by default
 */
function createProxy(target: any, path: string[] = []): any {
  return new Proxy(target, {
    get(target, prop, receiver) {
      if (typeof prop === "string") {
        const newPath = [...path, prop]

        if (prop === "$get") {
          return async (...args: any[]) => {
            const executor = getHandler(baseClient, ...newPath)
            const serializedQuery = serializeWithSuperJSON(args[0])
            return executor({ query: serializedQuery })
          }
        }

        if (prop === "$post") {
          return async (...args: any[]) => {
            const executor = getHandler(baseClient, ...newPath)
            const serializedJson = serializeWithSuperJSON(args[0])
            return executor({ json: serializedJson })
          }
        }

        return createProxy(target[prop], newPath)
      }
      return Reflect.get(target, prop, receiver)
    },
  })
}

export const client: typeof baseClient = createProxy(baseClient)
