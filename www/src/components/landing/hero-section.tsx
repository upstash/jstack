import { cn } from "@/lib/utils"
import Link from "next/link"
import { Icons } from "../icons"
import { Check } from "lucide-react"

export const HeroSection = () => {
  return (
    <section className="mt-20 relative flex items-center w-full flex-col gap-8 max-w-7xl mx-auto">
      <div className="w-full mx-auto py-12 md:py-20 flex flex-col items-center gap-5 md:gap-7 px-4 md:px-0">
        <div className="px-2.5 py-1 inline-flex items-center gap-3 bg-zinc-400/10 rounded-md ring-1 ring-inset ring-zinc-400/20">
          <Icons.confetti className="size-4" />
          <div className="h-4 w-px bg-zinc-600" />
          <p className="text-xs/6 font-medium text-zinc-300">
            JStack 1.0 just released!
          </p>
        </div>
        <h1
          className={cn(
            "inline-flex tracking-tight flex-col gap-1 transition text-center",
            "font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-none lg:text-[4rem]",
            "text-zinc-50",
          )}
        >
          <span>
            Ship{" "}
            <span className="relative whitespace-nowrap text-brand-400">
              <span className="absolute z-0 bg-brand-200/10 w-[105%] h-[105%] -left-[2.5%] -top-[2.5%] -rotate-1" />{" "}
              high-performance{" "}
              <span className="hidden sm:inline-block">⚡</span>
            </span>{" "}
          </span>
          <span>Next.js apps in minutes</span>
        </h1>

        <div className="flex flex-col items-center gap-6">
          <p className="text-muted-dark text-lg/7 md:text-xl/8 text-pretty sm:text-wrap sm:text-center text-center">
            The stack for building seriously{" "}
            <span className="text-muted-light">fast</span>,{" "}
            <span className="text-muted-light">lightweight</span> and{" "}
            <span className="inline sm:block">
              <span className="text-muted-light">end-to-end typesafe</span>{" "}
              Next.js apps.
            </span>
          </p>

          <ul className="grid gap-3 text-muted-dark text-lg/7">
            <li className="flex items-center gap-2">
              <Check className="size-5 text-brand-500" />
              <span>Incredible developer experience</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-5 text-brand-500" />
              <span>Automatic type-safety & autocompletion</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="size-5 text-brand-500" />
              <span>Deploy anywhere: Vercel, Cloudflare, etc.</span>
            </li>
          </ul>
        </div>

        <div className="relative flex max-w-sm w-full">
          <Icons.underline className="absolute -bottom-12 w-52 text-dark-gray left-1/2 -translate-x-1/2 transition-all duration-300" />
          <Link
            href="/docs/getting-started/first-steps"
            className="button relative z-10 bg-gradient-to-br shadow-xl mt-4 transition from-brand-300  to-brand-400 hover:scale-[0.98] active:scale-[0.95] h-14 font-semibold text-zinc-800 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-md cursor-pointer hover:bg-brand-200/75 w-full"
          >
            Start Shipping Today &rarr;
          </Link>
          <Icons.underline className="arrow absolute -bottom-12 w-52 text-dark-gray left-1/2 -translate-x-1/2 transition-all duration-300 [.button:hover~&]:text-brand-400 [.button:hover~&]:rotate-3" />
        </div>
      </div>
    </section>
  )
}
