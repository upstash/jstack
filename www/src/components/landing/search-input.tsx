import { Search } from "lucide-react"
import React from "react"

export const SearchInput = () => {
  return (
    <div className="relative w-full">
      <input
        type="text"
        disabled
        placeholder="Search docs... (soon)"
        className="w-full text-sm/6 bg-black/10 border border-dark-gray pl-10 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-400 placeholder:text-brand-50/50 placeholder:font-light placeholder:text-sm/6"
      />
      <Search className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
  )
}
