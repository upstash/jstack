"use client"

import { useState } from "react"
import { authClient } from "@/lib/auth-client"

export const AuthComponent = () => {
  const {
    data: session,
    isPending,
  } = authClient.useSession()

  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await authClient.signOut()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75 space-y-4">
      {isPending ? (
        <p className="text-center">Checking session...</p>
      ) : session?.user?.email ? (
        <div className="flex flex-col items-center gap-6 p-6 bg-zinc-900 rounded-xl shadow-lg">
          <div className="text-center">
            <p className="text-zinc-400 text-sm">Logged in as</p>
            <p className="font-semibold text-lg text-white">{session.user.email}</p>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="cursor-pointer w-full max-w-xs flex items-center justify-center gap-3 rounded-md text-base font-medium ring-2 ring-offset-2 ring-offset-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ring-transparent hover:ring-white h-12 px-6 py-3 bg-gradient-to-tr from-zinc-800 to-zinc-700 text-zinc-100 transition disabled:opacity-60"
          >
            {isLoading ? "Signing out..." : "Sign Out"}
          </button>
        </div>  

      ) : (
        <div className="flex justify-center">
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="cursor-pointer w-full flex items-center justify-center gap-3 rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-white focus-visible:outline-none focus-visible:ring-zinc-900 ring-transparent hover:ring-zinc-900 h-12 px-10 py-3 bg-zinc-800 text-zinc-100 font-medium bg-gradient-to-tl from-zinc-900 to-zinc-800 transition hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing up..." : "Sign Up with Google"}
          </button>
        </div>
      )}
    </div>
  )
}
