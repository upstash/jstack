"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const SearchBar = () => {
  return (
    <Dialog>
      <DialogTrigger disabled className="cursor-not-allowed">
        <div className="relative flex items-center">
          <Input
            readOnly
            className="pl-10 py-2 w-48 rounded cursor-pointer select-none focus-visible:ring-0"
            placeholder="Search (soon)"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-dark placeholder:text-muted-dark" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl h-96 overflow-y-auto">
        <DialogTitle className="sr-only">Search docs</DialogTitle>
        <div className="relative flex items-center mb-4">
          <Input
            autoFocus
            className="pl-10 h-12 placeholder:text-muted-dark cursor-pointer select-none focus-visible:ring-0"
            placeholder="Find something..."
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-dark" />
        </div>

        <div>
          results: <ul className="space-y-4"></ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SearchBar
