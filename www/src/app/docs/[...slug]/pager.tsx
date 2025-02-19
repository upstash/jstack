"use client"

import { Doc } from "content-collections"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useDocNavigation } from "../doc-navigation"
import { cn } from "@/lib/utils"

export function flattenNestedCat<T>(nestedArray: T[][]): T[] {
  return nestedArray.reduce((acc, curr) => acc.concat(curr), [])
}

type DocNav = {
  title: string
  meta: {
    filePath: string
    fileName: string
    directory: string
    path: string
    extension: string
  }
}

export function DocsPager({ page }: { page: Doc }) {
  const { sortedCategories } = useDocNavigation()

  const cats = sortedCategories.map(([_, docs]) =>
    docs.map((doc) => ({
      title: doc.title,
      meta: doc._meta,
    })),
  )

  const newArray = flattenNestedCat(cats)

  const currentPage = newArray.findIndex((item) => item.title === page.title)

  const prev = currentPage !== 0 ? newArray[currentPage - 1] : null
  const next =
    currentPage !== newArray.length - 1 ? newArray[currentPage + 1] : null

  console.log({ currentPage })

  return (
    <nav className="grid grid-cols-2 gap-4 !mt-10">
      <NavigationButton type="prev" item={prev} />
      <NavigationButton type="next" item={next} />
    </nav>
  )
}

type NavigationButtonProps = {
  item: DocNav | null | undefined
  type: "prev" | "next"
}

const NavigationButton = ({ item, type }: NavigationButtonProps) => {
  if (!item) {
    return <div />
  }
  const Icon = type === "next" ? ArrowRight : ArrowLeft
  return (
    <Link
      href={`/docs/${item.meta.path}`}
      className="flex w-full flex-col gap-2 rounded-lg border border-dark-gray bg-fd-card p-4 text-sm transition-colors hover:bg-zinc-900"
    >
      <span
        className={cn("flex items-center gap-2 text-zinc-600", {
          "flex-row-reverse": type === "next",
        })}
      >
        <Icon className="size-4" />
        <span className="capitalize">{type}</span>
      </span>
      <span
        className={cn({
          "self-end": type === "next",
        })}
      >
        {item.title}
      </span>
    </Link>
  )
}
