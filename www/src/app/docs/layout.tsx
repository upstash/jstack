import { ShinyButton } from "@/components/shiny-button"
import { allDocs } from "content-collections"
import { ChevronDown, Search, Star } from "lucide-react"
import Link from "next/link"
import { PropsWithChildren } from "react"
import { Icons } from "../../components/icons"
import SearchBar from "../../components/search-bar"
import { TableOfContents } from "../../components/table-of-contents"
import { MobileNavigation } from "./mobile-nav"
import { DOCS_CONFIG } from "@/config"
import { constructMetadata } from "@/lib/utils"

export const revalidate = 3600

export interface GitHubResponse {
  stargazers_count: number
}

export const metadata = constructMetadata({ title: "JStack Docs - Full-Stack Next.js & TypeScript Toolkit" })

async function getGitHubStars() {
  if (process.env.NODE_ENV === "development") return "500"
  const response = await fetch("https://api.github.com/repos/upstash/jstack", {
    next: { tags: ["github-stars"] },
  })
  const data = (await response.json()) as GitHubResponse
  return data.stargazers_count
}

const Layout = async ({ children }: PropsWithChildren) => {
  const stars = await getGitHubStars()

  const docsByCategory = Object.entries(DOCS_CONFIG.categories).reduce(
    (acc, [category, config]) => {
      const categoryDocs = allDocs.filter((doc) => doc._meta.path.split("/")[0] === category)
      const sortedDocs = categoryDocs.sort((a, b) => {
        const aIndex = config.items.indexOf(a._meta.path.split("/")[1] as string)
        const bIndex = config.items.indexOf(b._meta.path.split("/")[1] as string)
        return aIndex - bIndex
      })
      acc[category] = sortedDocs
      return acc
    },
    {} as Record<string, typeof allDocs>
  )

  const sortedCategories = Object.entries(docsByCategory).sort(([a], [b]) => {
    const aOrder = DOCS_CONFIG.categories[a as keyof typeof DOCS_CONFIG.categories]?.order ?? Infinity
    const bOrder = DOCS_CONFIG.categories[b as keyof typeof DOCS_CONFIG.categories]?.order ?? Infinity
    return aOrder - bOrder
  })

  return (
    <div className="relative min-h-screen h-screen w-full max-w-8xl mx-auto antialiased">
      <div className="relative h-full grid divide-y divide-dark-gray grid-cols-1 lg:grid-cols-[256px_1fr] xl:grid-cols-[256px_1fr_256px]">
        {/* Header row */}
        <div className="fixed bg-zinc-900 z-50 border-b border-dark-gray max-w-8xl w-full col-span-full grid grid-cols-1 lg:grid-cols-[256px_1fr] xl:grid-cols-[256px_1fr_256px]">
          <div className="bg-dark-gray/10 h-16">
            <div className="flex items-center justify-between gap-4 h-full px-6 sm:px-8">
              <Link href="/" aria-label="Home" className="flex h-full">
                <div className="flex gap-2 items-center justify-center">
                  <Icons.logo className="size-5 sm:size-6" />
                  <div className="flex items-center gap-1.5">
                    <p className="text-muted-light font-semibold tracking-tight">JStack</p>
                    <p className="text-muted-dark">docs</p>
                  </div>
                </div>
              </Link>

              <div className="hidden top-0 inset-x-0 h-16 sm:block lg:hidden">
                <SearchBar />
              </div>
              <button className="sm:hidden group p-4 hover:bg-dark-gray transition-colors rounded-full">
                <Search className="size-4 shrink-0 text-muted-dark group-hover:text-muted-light" />
              </button>
            </div>
          </div>

          <div className="px-6 h-16 sm:px-8 border-l border-r border-dark-gray bg-zinc-900">
            {/* desktop */}
            <div className="hidden lg:flex h-full w-full items-center justify-between">
              <SearchBar />
              <ShinyButton className="group text-sm text-muted-light" href="https://github.com/upstash/jstack">
                <Icons.github className="size-4 shrink-0" />
                Star on GitHub
                <Star className="size-4 shrink-0 fill-gray-500 group-hover:fill-brand-500 transition-colors stroke-transparent" />
                {stars.toLocaleString()}
              </ShinyButton>
            </div>

            {/* mobile */}
            <div className="flex text-sm lg:hidden h-full w-full items-center justify-between">
              <MobileNavigation />

              <button className="flex text-muted-dark items-center gap-1.5">
                <p>On this page</p>
                <ChevronDown className="size-4" />
              </button>
            </div>
          </div>

          <div className="h-16 hidden xl:block" />
        </div>

        {/* Content row */}
        <nav className="relative hidden lg:block px-4 pt-16 antialiased">
          <div className="fixed top-16 max-h-[calc(100vh-8rem)] overflow-y-auto w-60 pr-4 
            scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent hover:scrollbar-thumb-zinc-600">
            <ul className="py-8 [&>*+*]:border-t [&>*+*]:border-dark-gray [&>*]:py-8 first:[&>*]:pt-0 last:[&>*]:pb-0">
              {sortedCategories.map(([category, docs]) => (
                <li key={category}>
                  <p className="text-sm tracking-tight font-semibold text-muted-light uppercase mb-2">
                    <span className="inline-block mr-2">
                      {DOCS_CONFIG.categories[category as keyof typeof DOCS_CONFIG.categories]?.emoji}
                    </span>
                    {DOCS_CONFIG.categories[category as keyof typeof DOCS_CONFIG.categories]?.title ||
                      category.replace("-", " ")}
                  </p>
                  <ul className="space-y-2">
                    {docs.map((doc) => (
                      <li key={doc._meta.path}>
                        <Link
                          href={`/docs/${doc._meta.path}`}
                          className="text-sm text-muted-dark hover:text-muted-light transition"
                        >
                          {doc.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <main className="w-full h-full bg-dark-gray/10 border-x border-dark-gray">
          <div className="max-w-2xl h-full w-full mx-auto pt-44 lg:pt-32 px-6 sm:px-8">{children}</div>
        </main>

        <nav className="relative px-4 pt-10 hidden xl:block">
          <div className="sticky top-[6.5rem]">
            <TableOfContents />
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Layout
