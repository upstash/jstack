"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Icons } from "../../components/icons"
import { Menu, X } from "lucide-react"
import { DocNavigation } from "./doc-navigation"

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)

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

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-muted-light"
      >
        <Menu className="size-4" />
        <p>Menu</p>
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-800/40 backdrop-blur-sm dark:bg-black/80 lg:hidden" />
      )}
      <div
        className={cn(
          "fixed bg-zinc-900 flex w-4/5 flex-col gap-4 inset-y-0 left-0 z-50 overflow-y-auto px-8 pb-4 pt-3 shadow-lg lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Link
            onClick={() => setIsOpen(false)}
            href="/"
            aria-label="Home"
            className="flex h-full"
          >
            <div className="flex gap-3 py-1.5 items-center justify-center">
              <Icons.logo className="size-7" />
              <div className="flex items-center gap-1.5">
                <p className="text-muted-light font-semibold tracking-tight">
                  JStack
                </p>
                <p className="text-muted-dark">docs</p>
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

        <DocNavigation onLinkClick={() => setIsOpen(false)} className="mt-2" />
      </div>
    </>
  )
}
