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
import { Switch } from "@/components/ui/switch";
import { InfiniteDateSliderComponent } from "@/components/infinite-date-slider";

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
        layer: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
        tileMatrixSet: '250m',
        image: 'jpeg',
    },
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
    },
]

export default function Home() {
    const [stormData, setStormData] = useState<StormData[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [displayedStorm, setDisplayedStorm] = useState<StormData | null>(null)
    const [displayedObservations, setDisplayedObservations] = useState<StormObservation[]>([]);
    const [selectedLayer, setSelectedLayer] = useState<GIBS_TileLayerConfig | null>();
    const [displayedDate, setDisplayedDate] = useState<string | null>(null);
    const [displayedTime, setDisplayedTime] = useState<string | null>(null);
    const [isInfiniteDateScrolling, setIsInfiniteDateScrolling] = useState<boolean>(false);

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

    const onDateChange = useCallback((idx: number) => {
        if (displayedStorm) {
            setDisplayedObservations(displayedStorm.observations.slice(0, idx + 1));
            setDisplayedDate(displayedStorm.observations[idx].date)
            setDisplayedTime((displayedStorm.observations[idx].time))
        }
    }, [displayedStorm]);

    const incrementInfiniteDate = useCallback((date: Date) => {
        date.setDate(date.getDate() + 1)
        return date;
    }, []);

    const decrementInfiniteDate = useCallback((date: Date) => {
        date.setDate(date.getDate() - 1)
        return date;
    }, []);

    const onInfiniteDateChange = useCallback((date: string, time: string) => {
        if (date && time) {
            setDisplayedDate(date)
            setDisplayedTime(time)
        }
    }, []);


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


                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="search">Add layers</Label>
                            <AutocompleteSearchComponent data={GIBS_ConfigOptions} displayText={createGIBSConfigDisplayText} setSelectedItems={setSelectedLayer} />
                        </div>
                    </div>
                    <div>
                        Infinite Date
                        <Switch checked={isInfiniteDateScrolling} onCheckedChange={setIsInfiniteDateScrolling} />
                    </div>
                </CardContent>
            </Card>


            <EPSG4326Map>
                <div className="absolute bottom-0 left-0 z-[400] bg-white">
                    {isInfiniteDateScrolling ? 
                        <InfiniteDateSliderComponent incrementDate={incrementInfiniteDate} decrementDate={decrementInfiniteDate} onDateChange={onInfiniteDateChange}/>
                        :
                        <DateSliderComponent observations={displayedStorm?.observations ?? []} onDateChange={onDateChange} />
                    }
                </div>
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
                <GIBSTileLayer date={displayedDate ?? ''} time={displayedTime ?? ''} config={selectedLayer ?? GIBS_ConfigOptions[0]} />
                {displayedStorm &&
                    <StormMarkers stormObservations={displayedObservations} stormId={displayedStorm.storm_id} stormName={displayedStorm.name} />
                }
            </EPSG4326Map>
        </div>
    );
}
