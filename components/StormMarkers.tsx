import { StormData, StormObservation } from "@/app/page"
import { useEffect } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, LayersControl } from 'react-leaflet'

interface StormMarkersProps {
    stormObservations: StormObservation[]
    stormId: string
    stormName: string
}

export function StormMarkers({ stormObservations, stormId, stormName }: StormMarkersProps) {
    const map = useMap()

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
            {stormObservations
                    // .filter((_, idx) => idx === selectedDateIndex) // Only show observations for the selected date
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
