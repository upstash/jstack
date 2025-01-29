import {
  ArrowBigUpDash,
  Atom,
  Bot,
  CloudUpload,
  Code,
  Coins,
  Plug,
} from "lucide-react"
import { FeatureCard } from "./feature-card"
import Link from "next/link"
import { Icons } from "../icons"

const getTimeOfDay = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "morning"
  if (hour >= 12 && hour < 17) return "afternoon"
  return "evening"
}

export const FeatureSection = () => {
  return (
    <section className="mt-20 md:mt-32 relative flex items-center w-full flex-col gap-6 md:gap-8 max-w-7xl mx-auto px-4 md:px-6">
      <h2 className="text-4xl sm:text-5xl leading-none tracking-tight text-muted-light font-semibold text-center">
        Build a production-grade app{" "}
        <span className="relative block mt-2 md:inline md:mt-0 text-brand-400">
          {" "}
          <span className="absolute z-0 bg-brand-200/10 -left-2 -top-1 -bottom-1 -right-2 md:-left-3 md:-top-0 md:-bottom-0 md:-right-3 -rotate-1" />
          this {getTimeOfDay()}!
        </span>
      </h2>
      <p className="text-lg text-pretty md:text-xl/8 text-muted-dark text-center max-w-2xl">
        Everything you need to build & deploy your Next.js application,{" "}
        <span className="inline sm:block"> even if you're a beginner.</span>
      </p>
      <div id="features">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:w-[80%] mx-auto">
          <FeatureCard
            icon={
              <ArrowBigUpDash
                className="text-brand-300"
                strokeWidth={1.5}
                size={28}
              />
            }
            title="High Performance"
            description="Built on the fast, lightweight Hono framework. Easy deployment for performance & reliability."
          />
          <FeatureCard
            title="Deploy Anywhere"
            icon={
              <CloudUpload
                className="text-brand-300"
                strokeWidth={1.5}
                size={28}
              />
            }
            description="Deploy JStack to Cloudflare, Vercel, Netlify or others in seconds. The same code runs anywhere."
          />
          <FeatureCard
            title="End-to-End Type-Safe"
            icon={
              <Code className="text-brand-300" strokeWidth={1.5} size={28} />
            }
            description="Clean APIs with first-class TypeScript support and auto-complete. No schemas or code generation."
          />
          <FeatureCard
            icon={
              <Bot className="text-brand-300" strokeWidth={1.5} size={28} />
            }
            title="AI-Optimized Docs (soon)"
            description="Integrate with Cursor AI - share one link to provide a complete understanding of JStack, including source code."
          />
          <FeatureCard
            icon={
              <Plug className="text-brand-300" strokeWidth={1.5} size={28} />
            }
            title="Serverless WebSockets"
            description="Add reliable and scalable real-time features to your app. 100% serverless with no infrastructure to manage."
          />
          <FeatureCard
            title="Any State Manager"
            icon={
              <Atom className="text-brand-300" strokeWidth={1.5} size={28} />
            }
            description="JStack is compatible with any state manager. Perfect for React Query, Zustand, Jotai, or even Redux (🤮)."
          />
        </div>
      </div>
      <div className="w-full max-w-4xl mx-auto mt-16 mb-4">
        <div className="text-center">
          <p className="text-lg text-pretty md:text-xl/8 text-muted-dark text-center mb-6">
            Built on modern, battle-tested tools:
          </p>
        </div>
        <div className="w-full grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-8 px-4 md:px-6">
          <Link href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-opacity sm:border-r sm:border-dark-gray sm:pr-8">
            <Icons.nextjs className="w-24 md:w-32" />
          </Link>
          <Link href="https://hono.dev" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-opacity sm:border-r sm:border-dark-gray sm:pr-8">
            <div className="flex items-center gap-0.5">
              <Icons.hono className="size-12 md:size-16 text-orange-500 fill-orange-500" />
              <p className="font-bold text-2xl md:text-3xl/7">Hono</p>
            </div>
          </Link>
          <Link href="https://orm.drizzle.team" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-opacity sm:border-r sm:border-dark-gray sm:pr-8">
            <Icons.drizzle className="size-10 md:size-12" />
          </Link>
          <Link href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-opacity sm:border-r sm:border-dark-gray sm:pr-8">
            <Icons.typescript className="size-10 md:size-12" />
          </Link>
          <Link href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-opacity col-span-2 sm:col-span-1">
            <Icons.tailwind className="h-6 w-auto md:h-7 my-4 sm:my-0" />
          </Link>
        </div>
      </div>

      <div className="flex mt-4 max-w-xs w-full mb-24">
        <Link
          href="/docs/getting-started/first-steps"
          className="bg-gradient-to-br shadow-xl mt-4 transition from-brand-300  to-brand-400 hover:scale-[0.98] active:scale-[0.95] h-14 font-semibold text-zinc-800 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-md cursor-pointer hover:bg-brand-200/75  w-full max-w-xs"
        >
          Start Shipping Today &rarr;
        </Link>
      </div>
    </section>
  )
}
