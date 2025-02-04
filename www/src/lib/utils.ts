import { clsx, type ClassValue } from "clsx"
import { Metadata } from "next"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function remToPx(remValue: number) {
  let rootFontSize =
    typeof window === "undefined" ? 16 : parseFloat(window.getComputedStyle(document.documentElement).fontSize)

  return remValue * rootFontSize
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize(`NFD`)
    .trim()
    .replace(/\./g, ``)
    .replace(/\s+/g, `-`)
    .replace(/[^\w-]+/g, ``)
    .replace(/--+/g, `-`)
}

export function constructMetadata({
  title = "JStack - Full-Stack Next.js & TypeScript Toolkit",
  description = "Build fast, reliable Next.js apps with the most modern web technologies.",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@joshtriedcoding",
    },
    icons,
    metadataBase: new URL("https://jstack.app"),
  }
}

export const levenshtein = (a: string, b: string): number => {
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
