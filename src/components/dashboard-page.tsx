"use client"
import { usePathname, useRouter } from "next/navigation"
import React, { ReactNode } from "react"
import { Button } from "./ui/button"
import { ArrowLeft } from "lucide-react"

interface DashboardPageProps {
  title: string
  children?: ReactNode
  hideBackButton?: boolean
  cta?: ReactNode
}

const DashboardPage = ({
  title,
  hideBackButton,
  children,
  cta,
}: DashboardPageProps) => {
  const router = useRouter()

  return (
    <section className="flex-1 h-full w-full flex flex-col">
      <div className="w-full p-6 sm:p-8 flex justify-between border-b border-gray-200">
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-8">
            {hideBackButton ? null : (
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-fit bg-white"
                variant="outline"
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}

            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          {cta ? <div className="ml-auto">{cta}</div> : null}
        </div>
      </div>
      <div className="flex-1 p-6 sm:p-8 flex flex-col overflow-y-auto">
        {children}
      </div>
    </section>
  )
}

export default DashboardPage
