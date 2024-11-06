import { cn } from "@/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnchorHTMLAttributes } from "react";

interface ShinyButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

export const ShinyButton = ({
  className,
  children,
  href,
  ...props
}: ShinyButtonProps) => {
  return (
    <Link
      href={href ?? "#"}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-10 py-3 text-lg font-semibold text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
        className
      )}
      {...props}
    >
      {/* Main content with icon */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
        <ArrowRight className="size-5 shrink-0 text-white transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
      </span>

      {/* Floating glow effect */}
      <div className="absolute inset-0 -z-10 h-full w-full animate-pulse rounded-full bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 opacity-20 transition-all duration-500" />

      {/* Shine effect */}
      <div className="absolute -left-full top-0 h-full w-1/2 transform rotate-45 bg-gradient-to-r from-transparent to-white/70 opacity-30 transition-transform duration-500 ease-in-out group-hover:translate-x-full"></div>
    </Link>
  );
};
