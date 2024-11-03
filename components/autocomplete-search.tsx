'use client'

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
import { StormData } from '@/app/page'
import React, { useState, useEffect, useCallback, Dispatch } from 'react'

type Props<T> = {
    data: T[],
    displayText: (observations: T) => string
    setSelectedItems: Dispatch<T>
};

export function AutocompleteSearchComponent<T>({ data, displayText, setSelectedItems }: Props<T>) {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [dataText, setDataText] = useState<string[]>([]);

    useEffect(() => {
        setDataText(data.map((s) => displayText(s)))
    }, [data])

    const handleSelect = React.useCallback((currentValue: string, idx: number) => {
        setSelectedItems(data[idx])
        setInputValue(currentValue)
        setOpen(false)
        console.log('selecting ' + displayText(data[idx]))
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
                            {dataText
                                // .filter((item) => item.toLowerCase().includes(inputValue.toLowerCase()))
                                .map((item, idx) => {
                                    if (!item.toLowerCase().includes(inputValue.toLowerCase())) return
                                    return (
                                        <CommandItem
                                            key={idx}
                                            onSelect={() => handleSelect(item, idx)}
                                        >
                                            {item}
                                        </CommandItem>
                                    )
                                })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}