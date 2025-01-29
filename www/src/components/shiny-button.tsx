import { cn } from "@/lib/utils"
import Link from "next/link"
import React from "react"

export interface ShinyButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  loading?: boolean
  loadingColor?: "gray" | "white"
}

export const ShinyButton = ({
  className,
  children,
  href,
  loading = false,
  loadingColor = "white",
  ...props
}: ShinyButtonProps) => {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex transform items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded border border-dark-gray bg-zinc-800 h-9 px-4 text-base font-medium text-white transition-all duration-300 hover:ring-2 hover:ring-brand-500 ring-offset-2 ring-offset-zinc-900",
        className
      )}
      {...props}
    >
      {children}

      <div className="ease-[cubic-bezier(0.19,1,0.22,1)] absolute -left-[75px] -top-[50px] -z-10 h-[155px] w-8 rotate-[35deg] bg-muted-dark opacity-20 transition-all duration-500 group-hover:left-[120%]" />
    </Link>
  )
}

ShinyButton.displayName = "ShinyButton"
