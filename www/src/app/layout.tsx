import { cn, constructMetadata } from "@/lib/utils"
import type { Metadata } from "next"
import { Inter, Noto_Sans } from "next/font/google"
import localFont from "next/font/local"
import { Providers } from "../components/providers"

const fontCode = localFont({
  src: "../assets/JetBrainsMonoNL-Medium.ttf",
  variable: "--font-code",
})

import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const noto_sans = Noto_Sans({ subsets: ["latin"], variable: "--font-noto" })

export const metadata: Metadata = constructMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn(inter.variable, fontCode.variable, noto_sans.variable, "min-h-full")}>
      <body className="font-sans antialiased text-gray-200 bg-zinc-900 flex flex-col h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
