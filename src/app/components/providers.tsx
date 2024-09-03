"use client"

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { HTTPException } from "hono/http-exception"
import { PropsWithChildren } from "react"

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err) => {
      let errorMessage: string

      if (err instanceof HTTPException) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      } else {
        errorMessage = "An unknown error occurred."
      }

      // toast notify user, log as an example
      console.log(errorMessage)
    },
  }),
})

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
