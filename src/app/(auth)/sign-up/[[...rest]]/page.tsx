"use client"

import { SignUp } from "@clerk/nextjs"

const Page = () => {
  return (
    <div className="w-full flex-1 flex items-center justify-center">
      <SignUp />
    </div>
  )
}

export default Page