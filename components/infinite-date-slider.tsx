"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useCallback } from "react"
import { DateTime } from "luxon"

interface DateSliderProps {
  startDate: DateTime
  incrementDate: (date: DateTime) => DateTime
  decrementDate: (date: DateTime) => DateTime
  onDateChange: (date: DateTime) => void
}

export function InfiniteDateSliderComponent({
  startDate,
  incrementDate,
  decrementDate,
  onDateChange,
}: DateSliderProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [inputDateTime, setInputDateTime] = React.useState(startDate)
  // when you change the date through onDateChange, the startDate will be updated. This ref prevents the component from repeatedly rendering
  const currentDateRef = useRef(startDate)

  // Only update the ref and inputs when startDate changes from parent
  useEffect(() => {
    currentDateRef.current = startDate
    setInputDateTime(startDate)
  }, [startDate])

  const updateDate = (date: DateTime) => {
    currentDateRef.current = date
    onDateChange(date)
  }

  const nextSlide = useCallback(() => {
    const incrementedDate = incrementDate(currentDateRef.current)
    updateDate(incrementedDate)
  }, [incrementDate])

  const prevSlide = useCallback(() => {
    const decrementedDate = decrementDate(currentDateRef.current)
    updateDate(decrementedDate)
  }, [decrementDate])

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split('-').map(Number)
    const newDate = DateTime.utc(
      year,
      month,
      day,
      inputDateTime.hour,
      inputDateTime.minute,
      inputDateTime.second,
      inputDateTime.millisecond
    )
    if (newDate.isValid) {
      setInputDateTime(newDate)
      updateDate(newDate)
    }
  }

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value)
    if (isNaN(value)) {
      value = 0
    } else if (value < 0) {
      value = 23
    } else if (value > 23) {
      value = 0
    }
    const newDate = inputDateTime.set({ hour: value })
    if (newDate.isValid) {
      setInputDateTime(newDate)
      updateDate(newDate)
    }
  }

  const handleHourScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    console.log('scrolling')
    e.preventDefault()
    e.stopPropagation();

    const direction = e.deltaY < 0 ? 1 : -1
    const newHour = (inputDateTime.hour + direction + 24) % 24
    const newDate = inputDateTime.set({ hour: newHour })
    if (newDate.isValid) {
      setInputDateTime(newDate)
      updateDate(newDate)
    }
  }

  const handleInputBlur = () => {
    if (inputDateTime.isValid) {
      updateDate(inputDateTime)
    } else {
      setInputDateTime(currentDateRef.current)
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
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isPlaying, nextSlide])

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-4 bg-card rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-card-foreground">Infinite Date Slider</h3>
      <div className="relative h-24 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentDateRef.current.toISO()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-2xl font-mono font-bold text-primary absolute inset-0 flex flex-col items-center justify-center"
          >
            <div>{currentDateRef.current.toLocaleString(DateTime.DATE_FULL)}</div>
            <div className="text-xl mt-1">{currentDateRef.current.toFormat('HH:00:00')}</div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="date"
            value={inputDateTime.toFormat('yyyy-MM-dd')}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-full"
          />
          <div 
            className="relative"
            onWheelCapture={(e) => {
              console.log('scrolling');
              e.preventDefault();
              e.stopPropagation();
              handleHourScroll(e);
            }}
          >
            <Input
              type="number"
              min="0"
              max="23"
              value={inputDateTime.toFormat('HH')}
              onChange={handleHourChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-24 z-[600]"
              aria-label="Hour (24-hour format)"
            />
          </div>
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
    </div>
  )
}
