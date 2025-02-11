"use client"

import { useTableOfContents } from "@/ctx/use-table-of-contents"
import { cn, slugify } from "@/lib/utils"
import { AlignLeft } from "lucide-react"
import Link from "next/link"
import { HTMLAttributes, useCallback, useEffect } from "react"

interface TableOfContentsProps extends HTMLAttributes<HTMLDivElement> {}

const getIndentationClass = (level: number) => {
  switch (level) {
    case 2:
      return "pl-4"
    case 3:
      return "pl-8"
    case 4:
      return "pl-12"
    default:
      return "pl-4"
  }
}

export const TableOfContents = ({
  className,
  ...props
}: TableOfContentsProps) => {
  const visibleSections = useTableOfContents((state) => state.visibleSections)
  const allHeadings = useTableOfContents((state) => state.allHeadings)
  const setVisibleSections = useTableOfContents(
    (state) => state.setVisibleSections,
  )

  useEffect(() => {
    if (!allHeadings[0]) return

    if (allHeadings.length > 0 && visibleSections.length === 0) {
      const firstHeadingSlug = slugify(allHeadings[0].text)
      setVisibleSections([firstHeadingSlug])
    }
  }, [allHeadings, visibleSections, setVisibleSections])

  const handleClick = useCallback(
    (headingText: string) => {
      const slug = slugify(headingText)
      setVisibleSections([slug])
    },
    [setVisibleSections],
  )

  return (
    <div className="antialiased">
      <div className={cn("text-sm/7 relative", className)} {...props}>
        <p className="text-sm/7 font-semibold text-muted-light pl-4">
          On this page
        </p>
        <ul>
          {allHeadings.map((heading, i) => {
            const isVisible = visibleSections.some(
              (section) => section === slugify(heading.text),
            )
            const indentClass = getIndentationClass(heading.level)

            return (
              <li key={i} className="leading-relaxed py-1">
                <Link
                  href={`#${slugify(heading.text)}`}
                  onClick={() => handleClick(heading.text)}
                  className="relative flex"
                >
                  <div
                    className={cn(
                      "absolute left-4 w-0.5 top-0 h-full -translate-x-4 transition-colors",
                      isVisible ? "bg-brand-300" : "bg-transparent",
                    )}
                  />
                  <p
                    className={cn(
                      "text-muted-dark hover:text-muted-light transition py-1",
                      indentClass,
                      {
                        "text-muted-light": isVisible,
                      },
                    )}
                    key={heading.text}
                  >
                    {heading.text}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
