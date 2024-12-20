import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "../components/providers"
import { EB_Garamond } from "next/font/google"
import { cn } from "@/src/utils"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"
import { ourFileRouter } from "@/src/app/api/uploadthing/core"

import "./globals.css"
import AuthProvider from "../features/auth/components/auth-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const eb_garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
})

export const metadata: Metadata = {
  title: "jStack App",
  description: "Created using jStack",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      <html lang="en" className={cn(inter.variable, eb_garamond.variable)}>
        <body className="font-sans bg-brand-50 text-brand-950 antialiased">
          <NextSSRPlugin
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <Providers>{children}</Providers>
        </body>
      </html>
    </AuthProvider>
  )
}
