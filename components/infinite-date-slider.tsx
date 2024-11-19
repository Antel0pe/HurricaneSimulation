"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useRef } from "react"
import { parseLocalDate } from "@/utils/dateUtils"

interface DateSliderProps {
  startDate: string
  incrementDate: (date: Date) => Date
  decrementDate: (date: Date) => Date
  onDateChange: (date: string, time: string) => void
}

export function InfiniteDateSliderComponent({
  startDate,
  incrementDate,
  decrementDate,
  onDateChange,
}: DateSliderProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [inputDate, setInputDate] = React.useState(startDate.slice(0, 10))
  const startDateRef = useRef(startDate)

  useEffect(() => {
    startDateRef.current = startDate
    setInputDate(startDate.slice(0, 10))
  }, [startDate])

  const updateDate = (date: Date) => {
    const newDate = date.toISOString().slice(0, 10)
    const newTime = date.toISOString().slice(11, 19)
    onDateChange(newDate, newTime)
  }

  const nextSlide = () => {
    const current = parseLocalDate(startDateRef.current)
    const incrementedDate = incrementDate(current)
    updateDate(incrementedDate)
  }

  const prevSlide = () => {
    const current = parseLocalDate(startDateRef.current)
    const decrementedDate = decrementDate(current)
    updateDate(decrementedDate)
  }

  const togglePlay = () => {
    setIsPlaying((prev) => !prev)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputDate(e.target.value)
  }

  const handleInputBlur = () => {
    const date = new Date(inputDate)
    if (!isNaN(date.getTime())) {
      updateDate(date)
    } else {
      setInputDate(startDateRef.current.slice(0, 10))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur()
    }
  }

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout
    if (isPlaying) {
      intervalId = setInterval(nextSlide, 2000)
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isPlaying])

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-4 bg-card rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-card-foreground">Infinite Date Slider</h3>
      <div className="relative h-16 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={startDate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-2xl font-mono font-bold text-primary absolute inset-0 flex items-center justify-center"
          >
            {parseLocalDate(startDate).toDateString()}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="space-y-4">
        <Input
          type="date"
          value={inputDate}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="w-full"
        />
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
    </div>
  )
}