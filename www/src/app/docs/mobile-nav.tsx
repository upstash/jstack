"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Icons } from "../../components/icons"
import { allDocs } from "content-collections"
import { Menu, X } from "lucide-react"
import { DOCS_CONFIG } from "@/config"

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const docsByCategory = Object.entries(DOCS_CONFIG.categories).reduce(
    (acc, [category, config]) => {
      // Get docs for this category and sort them according to items array
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
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-1.5 text-muted-light">
        <Menu className="size-4" />
        <p>Menu</p>
      </button>
      {isOpen && <div className="fixed inset-0 z-50 bg-zinc-800/40 backdrop-blur-sm dark:bg-black/80 lg:hidden" />}
      <div
        className={cn(
          "fixed bg-zinc-900 flex w-4/5 flex-col gap-4 inset-y-0 left-0 z-50 overflow-y-auto px-8 pb-4 pt-3 shadow-lg lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <Link onClick={() => setIsOpen(false)} href="/" aria-label="Home" className="flex h-full">
            <div className="flex gap-2 items-center justify-center">
              <Icons.logo className="size-7" />
              <div className="flex flex-col justify-center">
                <p className="text-sm text-muted-light font-semibold">JStack</p>
                <p className="text-sm text-muted-dark">Documentation</p>
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1.5 hover:bg-zinc-800"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <hr className="w-full h-0.5 border-0 bg-dark-gray" />

        <nav className="mt-2">
          <ul className="space-y-8">
            {sortedCategories.map(([category, docs]) => (
              <li key={category}>
                <h2 className="text-sm font-semibold tracking-tight text-muted-light uppercase mb-2">
                  {DOCS_CONFIG.categories[category as keyof typeof DOCS_CONFIG.categories]?.title || category.replace("-", " ")}
                </h2>
                <ul className="space-y-2">
                  {docs.map((doc) => (
                    <li key={doc._meta.path}>
                      <Link
                        href={`/docs/${doc._meta.path}`}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block text-sm font-medium text-muted-dark hover:text-muted-light transition",
                          pathname === `/docs/${doc._meta.path}` && "text-brand-300"
                        )}
                      >
                        {doc.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
