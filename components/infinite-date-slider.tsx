"use client"
import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEffect, useState } from "react"
import { parseLocalDate } from "@/utils/dateUtils"

interface DateSliderProps {
    startDate: string
    incrementDate: (date: Date) => Date
    decrementDate: (date: Date) => Date
    onDateChange: (date: string, time: string) => void
}

export function InfiniteDateSliderComponent({ startDate, incrementDate, decrementDate, onDateChange }: DateSliderProps) {
    const [isPlaying, setIsPlaying] = React.useState(false)

    // useEffect(() => {
    //     if (startDate) {
    //         console.log(`start date changed so setting to ${startDate}`)
    //         setCurrentDate(new Date(startDate))
    //     }
    // }, [startDate])

    // const nextSlide = () => {
    //     const currentDate = new Date(startDate)
    //     console.log(`from next slide before, ${currentDate} + 1 day`)
    //     let incrementedDate = incrementDate(currentDate)
    //     console.log(`from next slide after, ${incrementedDate}`)
    //     setCurrentDate(incrementedDate);
    //     setDateIncrement((inc) => inc+1)
    // }

    // const prevSlide = () => {
    //     const currentDate = new Date(startDate)
    //     setCurrentDate(decrementDate(currentDate));
    //     setDateIncrement((inc) => inc-1)
    // }

    const nextSlide = () => {
        const current = parseLocalDate(startDate);
        const incrementedDate = incrementDate(current);
        onDateChange(
            incrementedDate.toISOString().slice(0, 10),
            incrementedDate.toISOString().slice(11, 19)
        );
    };

    const prevSlide = () => {
        const current = parseLocalDate(startDate);
        const decrementedDate = decrementDate(current);
        onDateChange(
            decrementedDate.toISOString().slice(0, 10),
            decrementedDate.toISOString().slice(11, 19)
        );
    };

    const togglePlay = () => {
        setIsPlaying((prev) => !prev)
    }

    // const handleDateSelect = (date: Date | undefined) => {
    //     if (date) {
    //         setCurrentDate(date);
    //         setDateIncrement((inc) => inc + 1);
    //     }
    // }
    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            onDateChange(date.toISOString().slice(0, 10), date.toISOString().slice(11, 19));
        }
    };

    React.useEffect(() => {
        let intervalId: NodeJS.Timeout
        if (isPlaying) {
            intervalId = setInterval(nextSlide, 2000)
        }
        return () => {
            if (intervalId) clearInterval(intervalId)
        }
    }, [isPlaying])

    // React.useEffect(() => {
    //     console.log(`from use effect, ${currentDate.toISOString()}`)
    //     onDateChange(currentDate.toISOString().slice(0, 10), currentDate.toISOString().slice(11, 19))
    // }, [currentDate.toISOString()])


    return (
        <div className="w-full max-w-md mx-auto py-6 px-2 space-y-6">
            <div className="flex justify-between items-center">
                <h3>Infinite Date</h3>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Calendar className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[999]" align="end">
                        <CalendarComponent
                            mode="single"
                            selected={new Date(startDate)}
                            onSelect={handleDateSelect}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={startDate}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0 flex items-center justify-center text-xl font-mono font-bold"
                    >
                        {parseLocalDate(startDate).toDateString()}
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="flex justify-between items-center">
                <Button variant="outline" size="icon" onClick={prevSlide} aria-label="Previous date">
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={nextSlide} aria-label="Next date">
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}