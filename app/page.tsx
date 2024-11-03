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
import GIBSTileLayer, { GIBS_TileLayerConfig } from "@/components/GIBS-TileLayer";
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

const GIBS_ConfigOptions: GIBS_TileLayerConfig[] = [
    {
        layer: 'MODIS_Combined_MAIAC_L2G_ColumnWaterVapor',
        tileMatrixSet: '1km',
        image: 'png',

    },
    {
        layer: 'AMSRU2_Surface_Precipitation_Day',
        tileMatrixSet: '2km',
        image: 'png',
    },
    {
        layer: 'MODIS_Aqua_Water_Vapor_5km_Day',
        tileMatrixSet: '2km',
        image: 'png',
    }
]

export default function Home() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<L.Map | null>(null)
    const markersRef = useRef<L.Layer[]>([])
    const [stormData, setStormData] = useState<StormData[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [displayedStorm, setDisplayedStorm] = useState<StormData | null>(null)
    const [displayedObservations, setDisplayedObservations] = useState<StormObservation[]>([]);
    const [selectedLayer, setSelectedLayer] = useState<GIBS_TileLayerConfig | null>();

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

    const onDateChange = useCallback((observations: StormObservation[]) => {
        if (displayedStorm) {
            setDisplayedObservations(observations);
            console.log(`displayed observartions ${observations}`)
            console.log(`displayed observartions ${observations[observations.length - 1]?.date} ${observations[observations.length - 1]?.time}`)
        }
    }, [displayedStorm]);

    const createStormName = (storm: StormData) => {
        return storm.name + ' ' + storm.storm_id;
    }

    const createGIBSConfigDisplayText = (config: GIBS_TileLayerConfig) => {
        return config.layer;
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
                            <AutocompleteSearchComponent data={stormData} displayText={createStormName} setSelectedItems={setDisplayedStorm} />
                        </div>
                    </div>
                    <DateSliderComponent observations={displayedStorm?.observations ?? []} onDateChange={onDateChange} />

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="search">Add layers</Label>
                            <AutocompleteSearchComponent data={GIBS_ConfigOptions} displayText={createGIBSConfigDisplayText} setSelectedItems={setSelectedLayer} />
                        </div>
                    </div>
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
                <GIBSTileLayer date={displayedObservations[displayedObservations.length - 1]?.date} time={displayedObservations[displayedObservations.length - 1]?.time} config={selectedLayer ?? GIBS_ConfigOptions[0]}/>
                {displayedStorm &&
                    <StormMarkers stormObservations={displayedObservations} stormId={displayedStorm.storm_id} stormName={displayedStorm.name} />
                }
            </EPSG4326Map>
        </div>
    );
}
