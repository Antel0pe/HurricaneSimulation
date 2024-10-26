'use client'

import * as React from 'react'
import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type Props = {
    displayItems: string[],
    setSelectedItems: React.Dispatch<React.SetStateAction<string>>
};

export function AutocompleteSearchComponent({ displayItems, setSelectedItems }: Props) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')

  const handleSelect = React.useCallback((currentValue: string) => {
    setSelectedItems(currentValue)
    setInputValue(currentValue)
      setOpen(false)
      console.log('selecting ' + currentValue)
  }, [setSelectedItems])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hurricanes..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setOpen(true)
            }}
            onClick={() => setOpen(true)}
            className="pl-8"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search storms..." 
            value={inputValue} 
            onValueChange={setInputValue} 
          />
          <CommandList>
            <CommandEmpty>No storm found.</CommandEmpty>
            <CommandGroup>
              {displayItems
                .filter((item) => item.toLowerCase().includes(inputValue.toLowerCase()))
                .map((item) => (
                  <CommandItem
                    key={item}
                    onSelect={() => handleSelect(item)}
                  >
                    {item}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}