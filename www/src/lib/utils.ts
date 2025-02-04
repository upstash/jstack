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
