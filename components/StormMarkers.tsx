'use client'

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, LayersControl } from 'react-leaflet'
import { StormObservation } from "./map-wrapper"

interface StormMarkersProps {
    stormData: StormObservation[]
    currentDisplayedDate: string
    stormId: string
    stormName: string
}

export function StormMarkers({ stormData, currentDisplayedDate, stormId, stormName }: StormMarkersProps) {
    const [currentDate, setCurrentDate] = useState<Date>(new Date('2020-01-01'))

    useEffect(() => {
        setCurrentDate(new Date(currentDisplayedDate))
    }, [currentDisplayedDate])

    // useEffect(() => {
    //     console.log(stormData)
    // }, [stormData])


    // useEffect(() => {
    //     if (stormObservations.length === 0) return

    //     // Fly to the first observation
    //     const firstObservation = stormObservations[0];
    //     if (firstObservation) {
    //         map.setView([firstObservation.latitude, firstObservation.longitude], map.getZoom())
    //     }
    // }, [stormObservations, stormId, map, stormName])

    const getColorForWindSpeed = (windSpeed: number): string => {
        if (windSpeed < 64) return '#00ff00' // Tropical Storm
        if (windSpeed < 83) return '#ffff00' // Category 1
        if (windSpeed < 96) return '#ffa500' // Category 2
        if (windSpeed < 113) return '#ff0000' // Category 3
        if (windSpeed < 137) return '#ff00ff' // Category 4
        return '#800080' // Category 5
    }

    return (
        <>
            {stormData
                .filter((obs): boolean => {
                    const obsTime = new Date(`${obs.date}T${obs.time.replace(' UTC', '')}Z`);
                    return obsTime <= currentDate;
                })
                // .filter((_, idx) => idx === selectedDateIndex) // Only show observations for the selected date
                .map((obs) => {
                    // console.log(obs);
                    return obs
                })
                .map((obs, idx) => (
                        <CircleMarker
                            key={`${stormId}-${idx}`}
                            center={[obs.latitude, obs.longitude]}
                            radius={6}
                            pathOptions={{
                                fillColor: getColorForWindSpeed(obs.wind_speed),
                                color: '#000',
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.8,
                            }}
                        >
                            <Popup>
                                <h3>{stormName}</h3>
                                <p>Date: {obs.date}</p>
                                <p>Time: {obs.time}</p>
                                <p>Wind Speed: {obs.wind_speed} knots</p>
                                <p>Pressure: {obs.pressure === -999 ? 'N/A' : obs.pressure + ' mb'}</p>
                            </Popup>
                        </CircleMarker> 
                    )
            )}
        </>
    )
}
