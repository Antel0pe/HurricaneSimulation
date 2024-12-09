// map-wrapper.tsx

"use client";

import dynamic from "next/dynamic";
import { EPSG4326Map_Props } from "./EPSG4326Map";
import { WMSTileLayer } from "react-leaflet";
import GIBSTileLayer, { GIBS_TileLayerConfig } from "./GIBS-TileLayer";
import { InfiniteDateSliderComponent } from "./infinite-date-slider";
import { PlayHurricaneMarkers } from "./playHurricaneMarkers";
import { StormMarkers } from "./StormMarkers";
import { Label } from "@radix-ui/react-label";
import { Switch } from "@radix-ui/react-switch";
import { AlertCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { AutocompleteSearchComponent } from "./autocomplete-search";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import HeatmapLayer from "./heatmap-layer";
import { HurricaneDataLayer, HurricaneLayerSelector } from "./hurricane-layer-selector";
import MSLHeatmapLayer from "./MSL_Heatmap_layer";
import LayerManager, { availableLayers } from "./LayerManager";
import { DateTime } from "luxon";

const Map = dynamic(() => import("./EPSG4326Map"), { ssr: false });

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

const MapWrapper = ({ children }: EPSG4326Map_Props) => {
    const [stormData, setStormData] = useState<StormData[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [displayedStorm, setDisplayedStorm] = useState<StormData | null>(null)
    const [displayedObservations, setDisplayedObservations] = useState<StormObservation[]>([]);
    const [selectedLayer, setSelectedLayer] = useState<GIBS_TileLayerConfig | null>();
    const [displayedDateTime, setDisplayedDateTime] = useState<DateTime>(DateTime.fromISO('2020-05-01T00:00:00'));
    const [showAllHurricanes, setShowAllHurricanes] = useState<boolean>(true);
    const [hurricaneDataLayer, setHurricaneDataLayer] = useState<HurricaneDataLayer | null>(null);

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
        if (!displayedStorm) return

        const date = displayedStorm.observations[0].date;
        const time = displayedStorm.observations[0].time.slice(0, 4 + 1);
        setDisplayedDateTime(DateTime.fromFormat(`${date}T${time}`, 'yyyy-MM-ddTHH:mm', { zone: 'utc' }));
    }, [displayedStorm])

    const incrementInfiniteDate = useCallback((date: DateTime) => {
        return date.plus({ hours: 6 });
    }, []);

    const decrementInfiniteDate = useCallback((date: DateTime) => {
        return date.minus({ hours: 6 });
    }, []);

    const onInfiniteDateChange = useCallback((date: DateTime) => {
        setDisplayedDateTime(date);
    }, []);

    const onHurricaneDataLayerChange = useCallback((layer: HurricaneDataLayer | null) => {
        setHurricaneDataLayer(layer)
        console.log(layer?.id + ' selected')
    }, [])

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
                            <AutocompleteSearchComponent data={stormData} displayText={createStormName} setSelectedItems={setDisplayedStorm} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="search">Add layers</Label>
                            <AutocompleteSearchComponent data={GIBS_ConfigOptions} displayText={createGIBSConfigDisplayText} setSelectedItems={setSelectedLayer} />
                        </div>
                    </div>
                    {/* <div>
                        Show All Hurricanes
                        <Switch checked={showAllHurricanes} onCheckedChange={setShowAllHurricanes} />
                    </div> */}
                </CardContent>
            </Card>

            <Map>
                <div
                    className="absolute bottom-0 left-0 z-[400] w-72 bg-white"
                    onWheelCapture={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}>

                    <InfiniteDateSliderComponent
                        startDate={displayedDateTime}
                        incrementDate={incrementInfiniteDate}
                        decrementDate={decrementInfiniteDate}
                        onDateChange={setDisplayedDateTime}
                    />
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
                <GIBSTileLayer
                    date={displayedDateTime.toFormat('yyyy-MM-dd')}
                    time={displayedDateTime.toFormat('HH:mm')}
                    config={selectedLayer ?? GIBS_ConfigOptions[0]}
                />

                {showAllHurricanes ?
                    (displayedDateTime &&
                        <PlayHurricaneMarkers
                            stormData={stormData}
                            displayedDate={displayedDateTime.toFormat('yyyy-MM-dd')}
                            displayedTime={displayedDateTime.toFormat('HH:mm')}
                        />
                    )
                    :
                    (displayedStorm && displayedDateTime &&
                        <StormMarkers
                            stormData={displayedStorm.observations}
                            currentDisplayedDate={displayedDateTime.toFormat('yyyy-MM-dd')}
                            stormId={displayedStorm.storm_id}
                            stormName={displayedStorm.name}
                        />
                    )
                }

                <LayerManager
                    selectedLayer={hurricaneDataLayer}
                    displayedDate={displayedDateTime.toFormat('yyyy-MM-dd')}
                    displayedTime={displayedDateTime.toFormat('HH:mm')}
                    displayedDateTime={displayedDateTime}
                />

                <HurricaneLayerSelector layers={availableLayers} onLayerChange={onHurricaneDataLayerChange} />
            </Map>
        </div>
    );
};

export default MapWrapper;