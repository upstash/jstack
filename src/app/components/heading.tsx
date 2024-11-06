import { cn } from "@/utils"
import { HTMLAttributes, ReactNode } from "react"


interface HeadingProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode
}

export const Heading = ({ children, className, ...props }: HeadingProps) => {
    return (
        <h1 className={cn("text-3xl sm:text-4xl text-pretty font-heading font-semibold tracking-tight text-zinc-800 ", 
        className)}
    {...props}
    >
        {children}
    </h1>
    )
}