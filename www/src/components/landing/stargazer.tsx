"use client"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function Stargazer({ login, name }: { login: string; name: string }) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0} key={login}>
        <TooltipContent className="text-center text-brand-50">
          <p>{name}</p>
          <p className="text-xs text-muted-dark">@{login}</p>
        </TooltipContent>
        <TooltipTrigger asChild>
          <a
            target="_blank"
            href={`https://github.com/${login}`}
            className={cn("transition-all relative -mx-0.5 hover:scale-125 hover:z-10")}
            rel="noreferrer"
          >
            <Avatar className="ring-4 size-10 ring-zinc-800">
              <AvatarImage src={`https://avatars.githubusercontent.com/${login}`} />
            </Avatar>
          </a>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  )
}

export function StargazerMore() {
  return (
    <div className={cn("transition-all relative -mx-0.5 hover:scale-125 hover:z-10")}>
      <Avatar className="ring-4 flex items-center justify-center size-10 ring-zinc-800 bg-zinc-800">
        <p className="text-xs font-semibold text-muted-dark">99+</p>
      </Avatar>
    </div>
  )
}

export function StargazerLoading() {
  return (
    <div className={cn("transition-all relative -mx-0.5")}>
      <Avatar className="ring-4 size-10 ring-zinc-800">
        <div className="w-full h-full bg-zinc-800 rounded-full">
          <div className="w-full h-full bg-zinc-700 rounded-full animate-pulse" />
        </div>
      </Avatar>
    </div>
  )
}
