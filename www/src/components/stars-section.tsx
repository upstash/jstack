"use client"

import { client } from "@/lib/client"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Star } from "lucide-react"
import { Icons } from "./icons"
import { Stargazer, StargazerLoading, StargazerMore } from "./landing/stargazer"
import { ShinyButton } from "./shiny-button"

export const StarsSection = () => {
  const { data: stargazerInfo, isPending } = useQuery({
    queryFn: async () => {
      const res = await client.stargazers.recent.$get()
      return await res.json()
    },
    queryKey: ["stargazer-info"],
  })

  return (
    <section className="relative w-full mt-12">
      <div className="w-full px-4 sm:px-0 flex gap-8 flex-col items-center py-28 border-y-2 border-dashed bg-black/20 border-dark-gray/50">
        <h1
          className={cn(
            "relative text-pretty z-10 tracking-tight gap-1 transition text-center",
            "font-display text-4xl sm:text-5xl font-semibold",
            "text-zinc-50",
          )}
        >
          <span className="relative text-white">
            <span className="absolute z-0 bg-brand-200/10 -left-2 -top-1 -bottom-1 -right-2 md:-left-3 md:-top-0 md:-bottom-0 md:-right-3 -rotate-1" />
            <span className="relative z-10 text-brand-400">
              {stargazerInfo?.stargazerCount.toLocaleString() || "..."} devs
            </span>
          </span>
          <span className="relative z-10">
            {" "}
            shipping modern Next.js{" "}
            <Icons.confetti className="inline ml-0.5 size-10 sm:size-12 -translate-y-[6px]" />
          </span>
        </h1>

        <p className="text-muted-dark text-lg/7 md:text-xl/8 max-w-prose text-center text-pretty sm:text-wrap">
          A real-time feed of the latest supporters - thanks for starring the
          GitHub repo!
        </p>

        <div className="flex items-center gap-2">
          <div className="flex justify-center items-center flex-wrap">
            {isPending ? (
              <>
                {Array.from({ length: 20 }).map((_, i) => (
                  <StargazerLoading key={i} />
                ))}
                <StargazerMore />
              </>
            ) : (
              <>
                {stargazerInfo?.stargazers.map((stargazer) => (
                  <Stargazer
                    key={stargazer.login}
                    login={stargazer.login}
                    name={stargazer.login}
                  />
                ))}

                <StargazerMore />
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 max-w-xs w-full mt-3 [&>.button:hover~.arrow]:-rotate-6">
          <ShinyButton
            className="order-2 button mt-1 px-4 py-2 h-14 w-full text-sm sm:text-base rounded-md text-muted-light"
            href="https://github.com/upstash/jstack"
          >
            <Icons.github className="size-4 shrink-0" />
            Star on GitHub
            <Star className="size-4 shrink-0 fill-gray-500 group-hover:fill-brand-500 transition-colors stroke-transparent" />
            {stargazerInfo?.stargazerCount.toLocaleString() || "..."}
          </ShinyButton>

          <Icons.arrow className="order-1 arrow size-20 text-brand-400 transition-transform duration-300" />

          <p className="order-3 text-xs text-muted-dark mt-1.5">
            Star the repo to appear above 🫶
          </p>
        </div>
      </div>
    </section>
  )
}
