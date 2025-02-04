"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/ctx/use-debounce"
import { client } from "@/lib/client"
import { cn } from "@/lib/utils"
import type { InferOutput } from "@/server"
import { SearchMetadata } from "@/types"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Search, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"

type SearchOutput = InferOutput["search"]["byQuery"]

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLUListElement>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  const debouncedSearchTerm = useDebounce(searchTerm, 150)

  const prevResultsRef = useRef<SearchOutput>([])

  const { data: results, isRefetching } = useQuery({
    queryKey: ["search", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return []

      const res = await client.search.byQuery.$get({
        query: debouncedSearchTerm,
      })

      const newResults = await res.json()
      prevResultsRef.current = newResults
      return newResults
    },
    initialData: [],
    enabled: debouncedSearchTerm.length > 0,
    placeholderData: () => prevResultsRef.current,
  })

  const displayedResults = isRefetching ? prevResultsRef.current : results

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prevIndex) =>
          prevIndex < (results?.length ?? 0) - 1 ? prevIndex + 1 : prevIndex,
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && results?.[selectedIndex]?.metadata) {
          handleResultClick({
            id: results[selectedIndex].id.toString(),
            title: results[selectedIndex].metadata.title,
            path: results[selectedIndex].metadata.path,
            level: results[selectedIndex].metadata.level,
            type: results[selectedIndex].metadata.type,
            content: results[selectedIndex].metadata.content,
            documentTitle: results[selectedIndex].metadata.documentTitle,
          })
        }
        break
      case "Escape":
        e.preventDefault()
        closeSearch()
        break
    }
  }

  const handleResultClick = (result: SearchMetadata & { id: string }) => {
    router.push(`/docs/${result.id}`)
    closeSearch()
  }

  const closeSearch = () => {
    setSearchTerm("")
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  useEffect(() => {
    if (isOpen && resultsRef.current) {
      const selectedElement = resultsRef.current.children[
        selectedIndex
      ] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" })
      }
    }
  }, [selectedIndex, isOpen])

  const highlightMatches = (text: string, query: string) => {
    if (!query.trim()) return text

    const searchWords = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (searchWords.length === 0) return text

    const levenshtein = (a: string, b: string): number => {
      if (a.length === 0) return b.length
      if (b.length === 0) return a.length

      const matrix: number[][] = Array(b.length + 1)
        .fill(null)
        .map(() => Array(a.length + 1).fill(null))

      for (let i = 0; i <= a.length; i++) matrix[0]![i] = i
      for (let j = 0; j <= b.length; j++) matrix[j]![0] = j

      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1
          matrix[j]![i] = Math.min(
            matrix[j]![i - 1]! + 1,
            matrix[j - 1]![i]! + 1,
            matrix[j - 1]![i - 1]! + cost,
          )
        }
      }

      return matrix[b.length]![a.length]!
    }

    const tokens = text.split(/(\s+|[.,!?;])/g)

    return tokens.map((token, i) => {
      const tokenLower = token.trim().toLowerCase()
      if (!tokenLower) return token

      const isMatch = searchWords.some((searchWord) => {
        if (tokenLower === searchWord) return true

        if (searchWord.length > 3 && tokenLower.includes(searchWord))
          return true

        if (
          Math.abs(tokenLower.length - searchWord.length) <= 2 &&
          tokenLower.length >= 4 &&
          searchWord.length >= 4 &&
          levenshtein(tokenLower, searchWord) <= 1
        ) {
          return true
        }

        return false
      })

      return isMatch ? (
        <mark key={i} className="bg-brand-400/20 text-brand-400 px-0.5 rounded">
          {token}
        </mark>
      ) : (
        token
      )
    })
  }

  const getContextAroundMatch = (content: string, query: string) => {
    if (!content || !query.trim()) return content

    const searchWords = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (searchWords.length === 0) return content

    const windowSize = 150
    let bestScore = 0
    let bestStart = 0

    for (let i = 0; i < content.length - windowSize; i += 50) {
      const window = content.slice(i, i + windowSize).toLowerCase()
      let score = 0

      searchWords.forEach((word) => {
        const matches = window.split(word).length - 1
        score += matches * word.length // weight longer word matches more heavily
      })

      if (score > bestScore) {
        bestScore = score
        bestStart = i
      }
    }

    const contextStart = Math.max(0, bestStart - 50)
    const contextEnd = Math.min(content.length, bestStart + windowSize)

    let excerpt = content.slice(contextStart, contextEnd).trim()

    // add ellipsis if we truncated
    if (contextStart > 0) excerpt = "..." + excerpt
    if (contextEnd < content.length) excerpt = excerpt + "..."

    return excerpt
  }

  // basic mdx renderer for search results, doesnt work perfectly but pretty well
  const renderMarkdownContent = (content: string) => {
    const patterns = [
      {
        regex: /```(?:.*\n)?([\s\S]*?)```/g,
        render: (_: string, code: string) => (
          <code className="font-mono px-1.5 py-0.5 text-muted-light rounded bg-[#2e2e32] whitespace-pre-wrap">
            {code.trim()}
          </code>
        ),
      },
      {
        regex: /`([^`]+)`/g,
        render: (_: string, code: string) => (
          <code className="font-mono px-1.5 py-0.5 text-muted-light rounded bg-[#2e2e32]">
            {code}
          </code>
        ),
      },
      {
        regex: /\[([^\]]+)\]\(([^)]+)\)/g,
        render: (_: string, text: string, href: string) => (
          <span className="inline underline underline-offset-4 text-muted-light font-medium">
            {text}
          </span>
        ),
      },
      {
        regex: /\*\*([^*]+)\*\*/g,
        render: (_: string, text: string) => (
          <b className="text-muted-light font-semibold">{text}</b>
        ),
      },
      {
        regex: /(?<=\s)_([^_]+)_(?=\s)/g,
        render: (_: string, text: string) => (
          <i className="text-muted-light italic">{text}</i>
        ),
      },
    ]

    let elements: (string | JSX.Element)[] = [content]

    patterns.forEach(({ regex, render }) => {
      elements = elements
        .map((element) => {
          if (typeof element !== "string") return element

          const parts: (string | JSX.Element)[] = []
          let lastIndex = 0
          let match

          while ((match = regex.exec(element)) !== null) {
            if (match.index > lastIndex) {
              parts.push(element.slice(lastIndex, match.index))
            }

            // @ts-expect-error tuple err
            parts.push(render(...match))
            lastIndex = match.index + match[0].length
          }

          if (lastIndex < element.length) {
            parts.push(element.slice(lastIndex))
          }

          return parts
        })
        .flat()
    })

    return elements
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)

        if (open === false) {
          queryClient.removeQueries({
            queryKey: ["search", debouncedSearchTerm],
          })
          setSearchTerm("")
          setSelectedIndex(-1)
        }
      }}
    >
      <DialogTrigger asChild>
        <div>
          <div className="relative hidden sm:flex items-center group">
            <Input
              readOnly
              className="pl-10 py-2 w-64 rounded-md cursor-pointer select-none focus-visible:ring-0 bg-zinc-400/10 border-zinc-400/20 text-zinc-300 placeholder:text-zinc-500  group-hover:placeholder-zinc-100"
              placeholder="Search docs..."
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-zinc-300" />
          </div>

          <button className="sm:hidden group p-4 hover:bg-dark-gray transition-colors rounded-full">
            <Search className="size-4 shrink-0 text-muted-dark group-hover:text-muted-light" />
          </button>
        </div>
      </DialogTrigger>
      <DialogContent
        className={`fixed left-[50%] sm:max-h-[calc(36rem+3.5rem)] sm:h-fit top-0 flex flex-col bottom-0 sm:top-24 -translate-x-1/2 sm:max-w-2xl p-6 overflow-hidden bg-zinc-900/95 border border-zinc-800 backdrop-blur-xl shadow-2xl`}
      >
        <DialogTitle className="sr-only">Search docs</DialogTitle>

        {/* mobile back button */}
        <button
          className="sm:hidden text-sm/6 p-2 text-zinc-400 hover:text-zinc-100 self-start"
          onClick={() => setIsOpen(false)}
        >
          &larr; Cancel
        </button>

        <div className="relative flex items-center">
          <Input
            ref={inputRef}
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-11 h-14 bg-zinc-800/50 border-zinc-700/50 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-brand-400/50 focus-visible:border-brand-400/50"
            placeholder="Search docs..."
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500"
            aria-hidden="true"
          />
          {searchTerm && (
            <>
              <button
                onClick={() => setSearchTerm("")}
                className="absolute sm:hidden right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-zinc-300"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>

              <span className="absolute hidden sm:block font-mono tracking-tight px-2 py-1 bg-black/15 border border-dark-gray rounded-md right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                esc
              </span>
            </>
          )}
        </div>

        {displayedResults?.length > 0 && (
          <div className="relative">
            <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-zinc-900/95 to-transparent pointer-events-none" />
            <ul
              id="search-results"
              ref={resultsRef}
              className="overflow-y-auto overflow-x-hidden pr-2 sm:max-h-[32rem] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent hover:scrollbar-thumb-zinc-600"
              role="listbox"
            >
              {displayedResults.map((result, index) => (
                <li
                  key={index}
                  id={`result-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={cn(
                    "px-4 rounded-lg cursor-pointer py-5",
                    index === selectedIndex && "bg-brand-200/10",
                    index !== selectedIndex && " hover:bg-zinc-800/70",
                  )}
                  onClick={() =>
                    result.metadata &&
                    handleResultClick({
                      id: result.id.toString(),
                      title: result.metadata.title,
                      path: result.metadata.path,
                      level: result.metadata.level,
                      type: result.metadata.type,
                      content: result.metadata.content,
                      documentTitle: result.metadata.documentTitle,
                    })
                  }
                >
                  <h3
                    className={cn("text-lg font-semibold text-zinc-100", {
                      "text-brand-400": index === selectedIndex,
                    })}
                  >
                    {highlightMatches(
                      result.metadata?.documentTitle || "",
                      debouncedSearchTerm,
                    )}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {highlightMatches(
                      result.metadata?.title || "",
                      debouncedSearchTerm,
                    )}
                  </p>
                  <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                    {result.metadata?.content &&
                      renderMarkdownContent(
                        getContextAroundMatch(
                          result.metadata.content,
                          debouncedSearchTerm,
                        ),
                      ).map((element, index) =>
                        typeof element === "string" ? (
                          highlightMatches(element, debouncedSearchTerm)
                        ) : (
                          <span key={index}>{element}</span>
                        ),
                      )}
                  </p>
                </li>
              ))}
            </ul>
            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-zinc-900/95 to-transparent pointer-events-none" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SearchBar
