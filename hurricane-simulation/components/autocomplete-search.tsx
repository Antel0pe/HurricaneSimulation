'use client'

import * as React from 'react'
import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Dispatch } from 'react'



type Props = {
    items: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export function AutocompleteSearchComponent( { items = [], setSelected }: Props) {
  const [open, setOpen] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState<string>('')
    

  const filteredItems = items.filter((i) =>
    i.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Storms..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
                setOpen(true)
                console.log(items)
            }}
            className="pl-8"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandEmpty>No storm found.</CommandEmpty>
          <CommandGroup>
            {filteredItems.map((i, idx) => (
              <CommandItem
                key={idx}
                    onSelect={(currentValue) => {
                    setSelected((curr: string[]) => [...curr, currentValue])
                //   setValue(currentValue === value ? '' : currentValue)
                  setSearchTerm(i)
                  setOpen(false)
                }}
              >
                {i}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}