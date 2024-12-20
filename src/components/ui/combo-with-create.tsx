"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"
import { ScrollArea } from "@/src/components/ui/scroll-area"

export type ComboboxOptions = {
  id: string
  name: string
}

type Mode = "single" | "multiple"

interface ComboboxProps {
  mode?: Mode
  options: ComboboxOptions[]
  selected: { id: string; name: string } | null
  className?: string
  placeholder?: string
  onChange?: (event: { id: string; name: string }) => void
  onCreate?: (value: string) => void
}

export function Combobox({
  options,
  selected,
  className,
  placeholder,
  mode = "single",
  onChange,
  onCreate,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState<string>("")

  return (
    <div className={cn("block", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selected && selected.id !== "" ? (
              <div className="relative mr-auto flex flex-wrap items-center overflow-hidden">
                <span>
                  {mode === "multiple" && Array.isArray(selected)
                    ? selected
                        .map(
                          (selectedId) =>
                            options.find((item) => item.id === selectedId)?.name
                        )
                        .join(", ")
                    : mode === "single" &&
                      options.find((item) => item.id === selected.id)?.name}
                </span>
              </div>
            ) : (
              placeholder ?? "Select Item..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 max-w-sm p-0">
          <Command>
            <CommandInput
              placeholder={placeholder ?? "Search Item..."}
              value={query}
              onValueChange={(value) => setQuery(value)}
            />
            <CommandEmpty
              onClick={() => {
                if (onCreate) {
                  onCreate(query)
                  setQuery("")
                }
              }}
              className="flex cursor-pointer items-center gap-1 italic"
            >
              <Plus className="h-3 w-3 text-gray-400" />
              <p className="truncate font-semibold text-primary">{query}</p>
            </CommandEmpty>
            <ScrollArea>
              <div className="max-h-80">
                <CommandGroup>
                  <CommandList>
                    {options.map((option) => (
                      <CommandItem
                        key={option.id}
                        value={option.name}
                        onSelect={() => {
                          if (onChange) {
                            if (
                              mode === "multiple" &&
                              Array.isArray(selected)
                            ) {
                              //   onChange(
                              //     selected.includes(option.id)
                              //       ? selected.filter(
                              //           (item) => item !== option.id
                              //         ).map(id => options.find(option => option.id === id)!)
                              //       : [...selected, option.id].map(id => options.find(option => option.id === id)!)
                              //   )
                            } else {
                              onChange(option)
                            }
                          }
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selected &&
                              (Array.isArray(selected)
                                ? selected.includes(option.id)
                                : selected.id === option.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </div>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
