"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronUp, Layers } from 'lucide-react'

export interface HurricaneDataLayer {
    id: string
    name: string
}

interface HurricaneLayerSelectorProps {
    layers: HurricaneDataLayer[]
    initialLayer?: string
    onLayerChange: (layer: HurricaneDataLayer | null) => void
}

export function HurricaneLayerSelector({
    layers,
    initialLayer,
    onLayerChange,
}: HurricaneLayerSelectorProps) {
    const [selectedLayer, setSelectedLayer] = React.useState<string | undefined>(undefined)
    const [isMinimized, setIsMinimized] = React.useState(false)

    const handleLayerChange = (value: string | undefined) => {
        // deselect option
        if (value && value === selectedLayer) {
            setSelectedLayer(undefined)
            onLayerChange(null)
        } else {
            setSelectedLayer(value)
            
            let matchingLayer = layers.filter((l) => l.id === value);
            if (matchingLayer.length > 0) {
                onLayerChange(matchingLayer[0])
            }
        }
    }

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized)
    }

    return (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md transition-all duration-300 ease-in-out">
            {isMinimized ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10"
                    onClick={toggleMinimize}
                    aria-label="Expand layer selector"
                >
                    <Layers className="h-4 w-4" />
                </Button>
            ) : (
                <div className="w-64">
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Map Layers</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={toggleMinimize}
                                aria-label="Minimize layer selector"
                            >
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                        </div>
                        <ScrollArea className="h-[200px] pr-4">
                            <RadioGroup >
                                {layers.map((layer) => (
                                    <div key={layer.id} className="flex items-center space-x-2 mb-4" onClick={() => handleLayerChange(layer.id)}>
                                        <RadioGroupItem checked={selectedLayer === layer.id} value={layer.id} id={layer.id} />
                                        <Label>{layer.name}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </ScrollArea>
                    </div>
                </div>
            )}
        </div>
    )
}

