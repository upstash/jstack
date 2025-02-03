"use client"

import { MenuIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Icons } from "../icons"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  return (
    <nav className="z-50 px-4 sm:px-8 py-4 w-full fixed bg-zinc-900 border-b border-dark-gray/50">
      <div className="max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between w-full sm:w-auto sm:justify-start sm:space-x-8">
            <div className="relative z-50 flex h-12 items-center justify-between w-full sm:w-auto">
              <Link href="/" className="flex gap-2 items-center">
                <Icons.logo className="size-5 sm:size-6" />
                <p className="text-muted-light tracking-tight font-semibold">
                  JStack
                </p>
              </Link>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-2 hover:text-white z-50 text-zinc-400"
              >
                {isMenuOpen ? (
                  <XIcon className="size-5" />
                ) : (
                  <MenuIcon className="size-5" />
                )}
              </button>
            </div>

            <div className="hidden sm:flex space-x-4 text-zinc-400 hover:text-zinc-300 ">
              <Link href="/docs" className="hover:text-white">
                Docs
              </Link>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href="#"
                      className="cursor-not-allowed text-zinc-700"
                    >
                      Templates
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>soon</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4 text-zinc-400">
            {/* <SearchInput />
            <div className="h-6 w-[1px] bg-dark-gray" /> */}

            <div className="flex gap-1.5 items-center">
              <Link
                href="https://discord.gg/4vCRMyzgA5"
                className="hover:text-white p-2"
              >
                <Icons.discord className="size-5" />
              </Link>
              <Link
                href="https://github.com/upstash/jstack"
                className="hover:text-white p-2"
              >
                <Icons.github className="size-5" />
              </Link>
              <Link
                href="https://x.com/joshtriedcoding"
                className="hover:text-white p-2"
              >
                <Icons.x className="size-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden mt-12 fixed inset-0 bg-zinc-900 z-40 pt-[72px]">
            <div className="h-full flex flex-col px-4">
              {/* <div className="mb-8 w-full">
                <SearchInput />
              </div> */}

              <div className="space-y-4">
                <p className="text-sm tracking-tight font-semibold text-muted-light uppercase">
                  Navigation
                </p>

                <div className="space-y-4">
                  <Link
                    href="/docs"
                    className="block text-brand-50/50 hover:text-white text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Docs
                  </Link>
                  <Link
                    aria-disabled
                    href="#"
                    className="block text-brand-50/25 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Templates (soon)
                  </Link>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-dark-gray">
                <div className="flex items-center justify-center gap-8">
                  <Link
                    href="https://discord.gg/4vCRMyzgA5"
                    className="hover:text-white text-zinc-400"
                  >
                    <Icons.discord className="size-5" />
                  </Link>
                  <Link
                    href="https://github.com/upstash/jstack"
                    className="hover:text-white text-zinc-400"
                  >
                    <Icons.github className="size-5" />
                  </Link>
                  <Link
                    href="https://x.com/joshtriedcoding"
                    className="hover:text-white text-zinc-400"
                  >
                    <Icons.x className="size-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
