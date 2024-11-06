import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-brand-700 text-brand-50 shadow-lg hover:bg-brand-800 hover:shadow-brand-300/50 hover:-translate-y-0.5 active:translate-y-0 dark:bg-brand-600 dark:hover:bg-brand-700 after:absolute after:inset-0 after:opacity-0 after:bg-gradient-to-r after:from-white/10 after:via-white/50 after:to-white/10 hover:after:animate-shine",
        
        glass:
          "bg-white/10 text-brand-50 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 hover:shadow-brand-300/30 hover:-translate-y-0.5 active:translate-y-0 dark:border-white/10 before:absolute before:inset-0 before:bg-gradient-to-r before:from-brand-500/0 before:via-brand-500/30 before:to-brand-500/0 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        
        retro:
          "bg-brand-700 text-brand-50 shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] border-2 border-black dark:border-white dark:shadow-[4px_4px_0_0_#fff] dark:hover:shadow-[2px_2px_0_0_#fff]",
        
        outline:
          "border-2 border-brand-500 bg-transparent text-brand-700 shadow-sm hover:bg-brand-500/10 hover:shadow-lg hover:shadow-brand-500/20 hover:-translate-y-0.5 active:translate-y-0 dark:text-brand-400 dark:hover:bg-brand-500/20 after:absolute after:inset-0 after:rounded-md after:shadow-[inset_0_0_10px_rgba(0,0,0,0)] hover:after:shadow-[inset_0_0_10px_rgba(0,0,0,0.2)] after:transition-shadow",
        
        emboss:
          "bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg hover:from-brand-700 hover:to-brand-900 hover:-translate-y-0.5 active:translate-y-0 before:absolute before:inset-[2px] before:rounded-[6px] before:bg-gradient-to-br before:from-white/20 before:to-transparent before:blur-sm hover:before:from-white/30",
        
        neon:
          "bg-brand-900 text-brand-100 shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.7)] hover:text-white hover:-translate-y-0.5 active:translate-y-0 before:absolute before:inset-0 before:bg-brand-600/0 hover:before:bg-brand-600/20 before:transition-colors after:absolute after:h-20 after:w-2 after:bg-white/20 after:rotate-12 after:-translate-x-20 hover:after:translate-x-[300%] after:transition-transform after:duration-1000",
        
        gradient:
          "bg-[length:200%_200%] bg-gradient-to-r from-brand-600 via-brand-800 to-brand-600 text-white shadow-lg hover:shadow-brand-300/50 hover:-translate-y-0.5 active:translate-y-0 animate-gradient-slow hover:animate-gradient-fast hover:bg-[length:300%_300%]",
        
        gooey:
          "bg-brand-700 text-white shadow-lg hover:shadow-brand-300/50 hover:-translate-y-0.5 active:translate-y-0 before:absolute before:inset-0 before:bg-brand-600 before:rounded-md before:transition-transform before:duration-300 hover:before:scale-[2] hover:before:opacity-0 before:animate-gooey",
        
        morphing:
          "bg-brand-700 text-white shadow-lg hover:shadow-brand-300/50 rounded-md hover:rounded-full transition-[border-radius,transform] hover:-translate-y-0.5 active:translate-y-0 duration-300 after:absolute after:inset-0 after:rounded-md after:hover:rounded-full after:bg-brand-600/0 hover:after:bg-brand-600/20 after:transition-all",
        
        liquid:
          "bg-brand-700 text-white shadow-lg hover:-translate-y-0.5 active:translate-y-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700 before:blur-md",
      },
      size: {
        default: "h-11 px-4 py-2 text-base",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-lg",
        xl: "h-14 px-10 text-xl",
        icon: "h-11 w-11",
        pill: "h-11 px-6 rounded-full",
        wide: "h-11 px-12 min-w-[200px]",
        square: "aspect-square p-4",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        spin: "animate-spin",
        ping: "animate-ping",
        wiggle: "animate-wiggle",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

// Add this to your global CSS for the custom animations
const globalStyles = `
@keyframes shine {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(200%);
  }
}

@keyframes gooey {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-shine:after {
  animation: shine 1.5s ease-in-out infinite;
}

.animate-gradient-slow {
  animation: gradient 5s ease infinite;
}

.animate-gradient-fast {
  animation: gradient 3s ease infinite;
}

.animate-gooey {
  animation: gooey 2s infinite;
}

.animate-wiggle {
  animation: wiggle 1s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}
`

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
