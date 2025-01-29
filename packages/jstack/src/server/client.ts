import { Hono } from "hono"
import { ClientRequestOptions, ClientResponse, hc } from "hono/client"
import { HTTPException } from "hono/http-exception"
import { Endpoint, ResponseFormat, Schema } from "hono/types"
import { ContentfulStatusCode } from "hono/utils/http-status"
import { HasRequiredKeys, UnionToIntersection } from "hono/utils/types"
import { ClientSocket, SystemEvents } from "jstack-shared"
import superjson from "superjson"
import { Router, RouterSchema } from "./router"

type ClientResponseOfEndpoint<T extends Endpoint = Endpoint> = T extends {
  output: infer O
  outputFormat: infer F
  status: infer S
}
  ? ClientResponse<
      O,
      S extends number ? S : never,
      F extends ResponseFormat ? F : never
    >
  : never

type ClientRequest<S extends Schema> = {
  [M in keyof S]: S[M] extends Endpoint & { input: infer R }
    ? R extends object
      ? HasRequiredKeys<R> extends true
        ? (
            args: R,
            options?: ClientRequestOptions
          ) => Promise<ClientResponseOfEndpoint<S[M]>>
        : (
            args?: R,
            options?: ClientRequestOptions
          ) => Promise<ClientResponseOfEndpoint<S[M]>>
      : never
    : never
} & {
  $url: (
    arg?: S[keyof S] extends { input: infer R }
      ? R extends { param: infer P }
        ? R extends { query: infer Q }
          ? { param: P; query: Q }
          : { param: P }
        : R extends { query: infer Q }
          ? { query: Q }
          : {}
      : {}
  ) => URL
} & (S["$get"] extends { outputFormat: "ws" }
    ? S["$get"] extends {
        input: infer I
        incoming: infer Incoming extends Record<string, any>
        outgoing: infer Outgoing extends Record<string, any>
      }
      ? {
          $ws: (args?: I) => ClientSocket<Outgoing & SystemEvents, Incoming>
        }
      : {}
    : {})

type PathToChain<
  Path extends string,
  S extends Schema,
  Original extends string = Path,
> = Path extends `/${infer P}`
  ? PathToChain<P, S, Path>
  : Path extends `${infer P}/${infer R}`
    ? {
        [K in P]: PathToChain<R, S, Original>
      }
    : {
        [K in Path extends "" ? "index" : Path]: ClientRequest<
          S extends Record<string, unknown> ? S[Original] : never
        >
      }

type UnwrapRouterSchema<T> = T extends RouterSchema<infer R> ? R : never

type Client<T extends Hono<any, any, any> | Router<any, any>> =
  T extends Hono<any, infer S>
    ? S extends Record<infer K, Schema>
      ? K extends string
        ? PathToChain<K, UnwrapRouterSchema<S>>
        : never
      : never
    : never

type OperationIO<
  T extends Hono<any, any, any> | Router<any, any>,
  IOType extends "input" | "output",
> =
  T extends Hono<any, infer S>
    ? S extends Record<infer K, Schema>
      ? K extends `${infer P}/${infer R}`
        ? {
            [Key in P]: {
              [SubKey in R]: UnwrapRouterSchema<S>[`${P}/${R}`] extends infer Operation
                ? Operation extends { $get: { [key in IOType]: any } }
                  ? Operation["$get"][IOType]
                  : Operation extends { $post: { [key in IOType]: any } }
                    ? Operation["$post"][IOType]
                    : never
                : never
            }
          }
        : never
      : never
    : never

export type InferRouterInputs<T extends Hono<any, any, any> | Router<any>> =
  UnionToIntersection<OperationIO<T, "input">>
export type InferRouterOutputs<T extends Hono<any, any, any> | Router<any>> =
  UnionToIntersection<OperationIO<T, "output">>

export interface ClientConfig extends ClientRequestOptions {
  baseUrl: string
  credentials?: RequestCredentials
}

export const createClient = <T extends Hono<any, any, any> | Router<any>>(
  options?: ClientConfig
): UnionToIntersection<Client<T>> => {
  const {
    baseUrl = "",
    credentials = "include",
    ...opts
  } = options ?? ({} as ClientConfig)

  const jfetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // remove baseUrl from input if already included, for example during SSR
    const inputPath = input.toString().replace(baseUrl, "")
    const targetUrl = baseUrl + inputPath

    const res = await fetch(targetUrl, {
      ...init,
      credentials,
      cache: "no-store",
    })

    if (!res.ok) {
      const message = await res.text()
      throw new HTTPException(res.status as ContentfulStatusCode, {
        message,
        res,
      })
    }

    res.json = () => parseJsonResponse(res)
    return res
  }

  const baseClient = hc(baseUrl, {
    ...opts,
    fetch: opts.fetch || jfetch,
  }) as unknown as UnionToIntersection<Client<T>>

  return createProxy(baseClient, baseUrl) as typeof baseClient
}

// export type ExtractAppRouter<T> = T extends {
//   _def: { routerConfig: Record<string, any> }
//   registeredPaths: string[]
//   handler: Hono<any, infer Schema, infer BasePath>
// }
//   ? { routes: Schema; basePath: BasePath }
//   : never

// export type ValidPath<AppType> =
//   ExtractAppRouter<AppType> extends { routes: infer R; basePath: infer BasePath }
//     ? keyof R extends `${infer RouterName}/${string}`
//       ? `${BasePath & string}/${RouterName}`
//       : never
//     : never

// export type UrlMap<AppType> = Partial<Record<ValidPath<AppType> | (string & {}), string>>

// const getCloudflareUrl = (input: string, cloudflareUrls: Partial<Record<string, string>>): string | null => {
//   const targetUrl = new URL(input)
//   const matchingKey = Object.keys(cloudflareUrls).find((key) => targetUrl.pathname.startsWith(key))

//   if (!matchingKey) return null

//   const mappedUrl = cloudflareUrls[matchingKey]
//   return mappedUrl + targetUrl.pathname
// }

const parseJsonResponse = async (response: Response): Promise<any> => {
  const text = await response.text()
  const isSuperjson = response.headers.get("x-is-superjson") === "true"

  try {
    return isSuperjson ? superjson.parse(text) : JSON.parse(text)
  } catch (error) {
    console.error("Failed to parse response as JSON:", error)
    throw new Error("Invalid JSON response")
  }
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

function createProxy(
  baseClient: any,
  baseUrl: string,
  path: string[] = []
): any {
  return new Proxy(baseClient, {
    get(target, prop, receiver) {
      if (typeof prop === "string") {
        const routePath = [...path, prop]

        if (prop === "$get") {
          return async (...args: any[]) => {
            const [data, options] = args
            const serializedQuery = serializeWithSuperJSON(data)
            return target.$get({ query: serializedQuery }, options)
          }
        }

        if (prop === "$post") {
          return async (...args: any[]) => {
            const [data, options] = args
            const serializedJson = serializeWithSuperJSON(data)
            return target.$post({ json: serializedJson }, options)
          }
        }

        if (prop === "$url") {
          return (args?: any) => {
            const endpointPath = `/${routePath.slice(0, -1).join("/")}`
            const normalizedPath = endpointPath.replace(baseUrl, "")
            const url = new URL(baseUrl + normalizedPath)

            if (args?.query) {
              Object.entries(args.query).forEach(([key, value]) => {
                url.searchParams.append(key, String(value))
              })
            }

            return url
          }
        }

        if (prop === "$ws") {
          return () => {
            const endpointPath = `/${routePath.slice(0, -1).join("/")}`
            const normalizedPath = endpointPath.replace(baseUrl, "")
            const url = new URL(baseUrl + normalizedPath)

            // Change protocol to ws:// or wss:// depending on if https or http
            url.protocol = url.protocol === "https:" ? "wss:" : "ws:"

            return new ClientSocket(url)
          }
        }

        return createProxy(target[prop], baseUrl, routePath)
      }

      return Reflect.get(target, prop, receiver)
    },
  })
}

// export const client: typeof baseClient = createProxy(baseClient)
