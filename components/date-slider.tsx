"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useEffect, useState } from "react"
import { StormObservation } from "@/app/page"

interface DateSliderProps {
    observations: StormObservation[]
    onDateChange?: (observations: StormObservation[]) => void 
}

export function DateSliderComponent({ observations, onDateChange }: DateSliderProps) {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [sliderDates, setSliderDates] = useState<string[]>([]);

    useEffect(() => {
        // console.log(sliderDates)
    }, [sliderDates])

    useEffect(() => {
        if (observations) {
            setSliderDates(observations.map((o) => createDateTime(o)))
        }
    }, [observations])

    const createDateTime = (obs: StormObservation) => {
        return obs.date + ' ' + obs.time;
    }

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % sliderDates.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + sliderDates.length) % sliderDates.length)
    }

    const togglePlay = () => {
        setIsPlaying((prev) => !prev)
    }

    React.useEffect(() => {
        let intervalId: NodeJS.Timeout

        if (isPlaying) {
            intervalId = setInterval(nextSlide, 2000) // Change slide every 2 seconds
        }

        return () => {
            if (intervalId) clearInterval(intervalId)
        }
    }, [isPlaying])

    React.useEffect(() => {
        if (onDateChange) {
            onDateChange(observations.slice(0, currentIndex + 1))
        }
    }, [currentIndex])

    // Effect to reset currentIndex when sliderDates change
    React.useEffect(() => {
        console.log(`slider dates changed ${sliderDates}`)
        setCurrentIndex(0)
        // Optionally, pause the slider when dates change
        setIsPlaying(false)
    }, [sliderDates])

    useEffect(() => {
        console.log('date change func changed')
    }, [onDateChange])

    return (
        <div className="w-full max-w-md mx-auto p-6 space-y-6">
            <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
                <AnimatePresence initial={false}>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0 flex items-center justify-center text-xl font-mono font-bold"
                    >
                        {sliderDates[currentIndex]}
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

            <Slider
                value={[currentIndex]}
                min={0}
                max={sliderDates.length - 1}
                step={1}
                onValueChange={(value) => setCurrentIndex(value[0])}
                className="w-full"
            />
        </div>
    )
}