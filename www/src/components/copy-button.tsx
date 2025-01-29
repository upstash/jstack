"use client"

import { useState } from "react"

interface CopyButtonProps {
  code: string
  className?: string
}

export const CopyButton = ({ code, className }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    // Extract just the code content by removing backticks and meta string
    const cleanCode = code.replace(/^```.*\n([\s\S]*?)```$/m, '$1').trim()
    await navigator.clipboard.writeText(cleanCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={onCopy}
      className={`text-muted-foreground hover:text-muted-light transition-colors p-1.5 rounded-md hover:bg-secondary/10 ${className}`}
      title={copied ? "Copied!" : "Copy code"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {copied ? (
          <path d="M20 6L9 17L4 12" />
        ) : (
          <>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </>
        )}
      </svg>
    </button>
  )
}
