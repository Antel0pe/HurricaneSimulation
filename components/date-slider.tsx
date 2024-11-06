import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, RepeatIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface StormObservation {
  date: string;
  time: string;
}

interface DateSliderProps {
  observations: StormObservation[];
  onDateChange?: (idx: number) => void;
}

export function DateSliderComponent({ observations, onDateChange }: DateSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderDates, setSliderDates] = useState<string[]>([]);
  const [isInfiniteMode, setIsInfiniteMode] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const [isRangeMode, setIsRangeMode] = useState(false);

  useEffect(() => {
    if (observations && observations.length > 0) {
      const dates = observations.map((o) => createDateTime(o));
      setSliderDates(dates);
      setEndIndex(dates.length - 1);
      
      // Initialize currentDate from the first observation
      const firstDate = new Date(observations[0].date + ' ' + observations[0].time);
      setCurrentDate(firstDate);
    }
  }, [observations]);

  const createDateTime = (obs: StormObservation) => {
    return `${obs.date} ${obs.time}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
  };

  const incrementDate = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getDay() + 1); // Increment by 1 day
    return newDate;
  };

  const nextSlide = () => {
    if (isInfiniteMode && currentDate) {
      setCurrentDate(incrementDate(currentDate));
      return;
    }

    setCurrentIndex((prevIndex) => {
      if (isRangeMode) {
        if (prevIndex >= endIndex) {
          return startIndex;
        }
        return prevIndex + 1;
      } else {
        return (prevIndex + 1) % sliderDates.length;
      }
    });
  };

  const prevSlide = () => {
    if (isInfiniteMode && currentDate) {
      const newDate = new Date(currentDate);
      newDate.setHours(newDate.getDay() - 1);
      setCurrentDate(newDate);
      return;
    }

    setCurrentIndex((prevIndex) => {
      if (isRangeMode) {
        if (prevIndex <= startIndex) {
          return endIndex;
        }
        return prevIndex - 1;
      } else {
        return (prevIndex - 1 + sliderDates.length) % sliderDates.length;
      }
    });
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPlaying) {
      intervalId = setInterval(nextSlide, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, isInfiniteMode, startIndex, endIndex, isRangeMode]);

    
    // IMPORTANT: NEED TO SEND REAL DATE for satellite images
  useEffect(() => {
    if (!isInfiniteMode && onDateChange) {
      onDateChange(currentIndex);
    }
  }, [currentIndex, onDateChange, isInfiniteMode]);

  useEffect(() => {
    if (!isInfiniteMode) {
      setCurrentIndex(startIndex);
    }
    setIsPlaying(false);
  }, [sliderDates, isInfiniteMode]);

  const handleRangeChange = (values: number[]) => {
    if (isRangeMode) {
      setStartIndex(values[0]);
      setEndIndex(values[1]);
      setCurrentIndex(values[0]);
    } else {
      setCurrentIndex(values[0]);
    }
  };

  const toggleInfiniteMode = (checked: boolean) => {
    setIsInfiniteMode(checked);
    if (checked) {
      setIsRangeMode(false);
      if (observations.length > 0) {
        const lastObsDate = new Date(observations[observations.length - 1].date + ' ' + observations[observations.length - 1].time);
        setCurrentDate(lastObsDate);
      }
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-6 px-2 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={isInfiniteMode}
            onCheckedChange={toggleInfiniteMode}
            id="infinite-mode"
          />
          <label htmlFor="infinite-mode" className="text-sm">
            Continue to Present
          </label>
        </div>
        {!isInfiniteMode && (
          <div className="flex items-center space-x-2">
            <Switch
              checked={isRangeMode}
              onCheckedChange={setIsRangeMode}
              id="range-mode"
            />
            <label htmlFor="range-mode" className="text-sm">
              Date Range
            </label>
          </div>
        )}
      </div>

      <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={isInfiniteMode ? currentDate?.getTime() : currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 flex items-center justify-center text-xl font-mono font-bold"
          >
            {isInfiniteMode 
              ? (currentDate ? formatDate(currentDate) : '')
              : sliderDates[currentIndex]
            }
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" size="icon" onClick={prevSlide}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={nextSlide}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!isInfiniteMode && (
        <>
          {isRangeMode ? (
            <Slider
              value={[startIndex, endIndex]}
              min={0}
              max={sliderDates.length - 1}
              step={1}
              onValueChange={handleRangeChange}
              className="w-full"
            />
          ) : (
            <Slider
              value={[currentIndex]}
              min={0}
              max={sliderDates.length - 1}
              step={1}
              onValueChange={(value) => setCurrentIndex(value[0])}
              className="w-full"
            />
          )}

          {isRangeMode && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{sliderDates[startIndex]}</span>
              <span>{sliderDates[endIndex]}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}