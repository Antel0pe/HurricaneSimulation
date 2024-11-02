"use client"

import { StormMapComponent } from "@/components/storm-map";
import Image from "next/image";
import ProjCRSMap from "@/components/EPSG4326Map";
import { AutocompleteSearchComponent } from "@/components/autocomplete-search";
import { DateSliderComponent } from "@/components/date-slider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { useRef, useState, useEffect, useCallback } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import EPSG4326Map from "@/components/EPSG4326Map";
import GIBSTileLayer from "@/components/testGIBS";
import { WMSTileLayer } from "react-leaflet";
import { StormMarkers } from "@/components/StormMarkers";

export interface StormObservation {
    date: string
    time: string
    latitude: number
    longitude: number
    wind_speed: number
    pressure: number
}

export interface StormData {
    storm_id: string
    name: string
    num_records: number
    observations: StormObservation[]
}

export default function Home() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<L.Map | null>(null)
    const markersRef = useRef<L.Layer[]>([])
    const [stormData, setStormData] = useState<StormData[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedStormIds, setSelectedStormIds] = useState<string>('');
    const [displayedStorm, setDisplayedStorm] = useState<StormData | null>(null)
    const [displayedObservations, setDisplayedObservations] = useState<StormObservation[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/processed-hurdat2.json')
                if (!response.ok) {
                    throw new Error('Failed to fetch storm data')
                }
                const data: StormData[] = await response.json()
                setStormData(data)
                setLoading(false)
            } catch (err) {
                setError('Error loading storm data. Please try again later.')
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (!selectedStormIds) return;

        let storm = getStorm(selectedStormIds);
        if (storm) {
            let firstStorm = storm[0];
            setDisplayedStorm(firstStorm);
        }
    }, [selectedStormIds])

    const createStormName = (data: StormData) => {
        return data.name + ' ' + data.storm_id
    }

    const getStorm = (name: string) => {
        return stormData.filter((storm) => name.includes(createStormName(storm)))
    }

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading storm data...</div>
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    const getDateTimeOfObservations = () => {
        let dateTimes = getStorm(selectedStormIds).flatMap((s) => s.observations).map((s) => s.date + ' ' + s.time)
        console.log(dateTimes.length)
        return dateTimes
    }

    const onDateChange = (idx: number) => {
        // let filteredStorms = getStorm(selectedStormIds)[0]

        // if (filteredStorms) {
        //     let newObs = filteredStorms.observations[idx]
        //     // updateMapWhenDateChanges(newObs.date)
        //     // let marker = plotObservation(selectedStormIds, newObs)

        //     // fly to the first marker
        //     if (idx === 0) {
        //         map.current?.setView([newObs.latitude, newObs.longitude], map.current.getZoom())
        //     }
        // }

        // setDateIdx(idx);
        if (displayedStorm && (idx) !== displayedObservations.length) {
            setDisplayedObservations(displayedStorm.observations.slice(0, idx + 1));
        }
    }



    return (
        <div className="h-screen flex">
            <Card className="w-1/4 p-4 overflow-y-auto">
                <CardHeader>
                    <CardTitle>Storm Data Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="search">Search by Storm Name</Label>
                            {/* items={stormData.map((s) => s.name + ' ' + s.storm_id)} */}
                            <AutocompleteSearchComponent displayItems={stormData.map((d) => createStormName(d))} setSelectedItems={setSelectedStormIds} />
                        </div>
                    </div>
                    <DateSliderComponent sliderDates={displayedStorm?.observations.flatMap((s) => s.date + ' ' + s.time ) ?? []} onDateChange={onDateChange} />
                </CardContent>
            </Card>
            <EPSG4326Map>
                <WMSTileLayer
                    url="https://ows.terrestris.de/osm/service?"
                    layers="OSM-WMS"
                    format="image/png"
                    transparent={false}
                    attribution="&copy; OpenStreetMap contributors"
                    // continuousWorld={true}
                    noWrap={true}
                />
                {/* GIBS Tile Layer */}
                <GIBSTileLayer />
                {displayedStorm &&
                    <StormMarkers stormObservations={displayedObservations} stormId={displayedStorm.storm_id} stormName={displayedStorm.name} />
                }
            </EPSG4326Map>
        </div>
    );
}
