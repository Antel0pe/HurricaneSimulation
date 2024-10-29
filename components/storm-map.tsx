'use client'

import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { AutocompleteSearchComponent } from './autocomplete-search'
import { DateSliderComponent } from './date-slider';

// Note: Replace with your actual Mapbox access token
// mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

interface StormObservation {
    date: string
    time: string
    latitude: number
    longitude: number
    wind_speed: number
    pressure: number
}

interface StormData {
    storm_id: string
    name: string
    num_records: number
    observations: StormObservation[]
}

export function StormMapComponent() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const [stormData, setStormData] = useState<StormData[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedStormIds, setSelectedStormIds] = useState<string>('');

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
        if (loading || error || !mapContainer.current) return

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://demotiles.maplibre.org/style.json',
            center: [-75, 35], // Centered on the Atlantic
            zoom: 3,
        })

        console.log('map is being set')

        return () => {
            map.current?.remove()
        }
    }, [loading, error])

    useEffect(() => {
        console.log('should be removed')
        removeStormMarkers();
    }, [selectedStormIds])

    map.current?.on('load', () => {
        console.log('map has loaded')
        map.current?.addSource('gibs-tiles', {
            'type': 'raster',
            'tiles': [getGIBSUrl()],
            // 'bounds': bounds,
            'attribution': 'Imagery courtesy of NASA/GSFC'
        });

        map.current?.addLayer({
            'id': 'gibs-layer',
            'type': 'raster',
            'source': 'gibs-tiles',
            'minzoom': 3,
            'maxzoom': 9,
            // 'paint': {
            //     'raster-opacity': 0.8
            // }
        });
    });

    const getLatLongGivenTiles = (row: number, col: number, zoom: number) => {
        let n = 2 ^ zoom;
        let lon_deg = row / n * 360.0 - 180.0;
        let lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * col / n)));
        let lat_deg = lat_rad * 180.0 / Math.PI;

        return [lat_deg, lon_deg];
    }

    const getTilesGivenLatLong = (zoom: number, lat: number, long: number) => {
        let n = 2 ^ zoom
        let xtile = n * ((long + 180) / 360)
        let ytile = n * (1 - (Math.log(Math.tan(lat) + Math.acos(lat)) / Math.PI)) / 2

        return [xtile, ytile]
    }

    //https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2017-09-26T00:00:00Z/250m/3/2/2.jpg
    const getGIBSUrl = (date: string = '2017-09-26') => {
        return `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/250m/{z}/{y}/{x}.jpg`;

        // return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpeg`;


    }

    const removeStormMarkers = () => {
        // Remove existing markers
        const existingMarkers = document.getElementsByClassName('maplibregl-marker')
        while (existingMarkers[0]) {
            existingMarkers[0].remove()
        }
    }

    const addStormMarkers = () => {
        if (!map.current) return

        removeStormMarkers();

        let newMarkersLatLong: number[][] = [];

        let filteredStorms = getStorm(selectedStormIds);
        filteredStorms.forEach(storm => {

            storm.observations.forEach(obs => {
                newMarkersLatLong.push([obs.latitude, obs.longitude]);
                // plotObservation(storm.name, obs);
            }
            )
        })

        // Add your point data
        // map.current?.addSource('hurricane-points', {
        //     'type': 'geojson',
        //     'data': {
        //         'type': 'FeatureCollection',
        //         'features': filteredStorms.flatMap((s) => s.observations).map((obs) => ({
        //             'type': 'Feature',
        //             'geometry': {
        //                 'type': 'Point',
        //                 'coordinates': [obs.longitude, obs.latitude],
        //             },
        //             'properties': {
        //                 'timestamp': obs.date + ' ' + obs.time,
        //             },
        //         })),
        //     },
        // });

        // Add a layer to display the points
        // map.current?.addLayer({
        //     'id': 'hurricane-points-layer',
        //     'type': 'circle',
        //     'source': 'hurricane-points',
        //     'paint': {
        //         'circle-radius': 6,
        //         'circle-color': '#ff0000',
        //     },
        // });

        return newMarkersLatLong;
    }

    const plotObservation = (stormName: string, obs: StormObservation) => {
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
            `<h3>${stormName}</h3>
             <p>Date: ${obs.date}</p>
             <p>Time: ${obs.time}</p>
             <p>Wind Speed: ${obs.wind_speed} knots</p>
             <p>Pressure: ${obs.pressure === -999 ? 'N/A' : obs.pressure + ' mb'}</p>`
        )

        return new maplibregl.Marker({
            color: getColorForWindSpeed(obs.wind_speed)
        })
            .setLngLat([obs.longitude, obs.latitude])
            .setPopup(popup)
            .addTo(map.current!)


    }

    const createStormName = (data: StormData) => {
        return data.name + ' ' + data.storm_id;
    }

    const getStorm = (name: string) => {
        return stormData.filter((storm) => name.includes(createStormName(storm)));
    }

    const getColorForWindSpeed = (windSpeed: number): string => {
        if (windSpeed < 64) return '#00ff00' // Tropical Storm
        if (windSpeed < 83) return '#ffff00' // Category 1
        if (windSpeed < 96) return '#ffa500' // Category 2
        if (windSpeed < 113) return '#ff0000' // Category 3
        if (windSpeed < 137) return '#ff00ff' // Category 4
        return '#800080' // Category 5
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

    const getUniqueDatesOfStorm = () => {
        let dates = getStorm(selectedStormIds).flatMap((s) => s.observations).map((s) => s.date);
        let uniqueDates: string[] = Array.from(new Set(dates));
        return uniqueDates;
    }

    const onDateChange = (idx: number) => {
        let filteredStorms = getStorm(selectedStormIds)[0];

        if (filteredStorms) {
            let newObs = filteredStorms.observations[idx];
            updateMapWhenDateChanges(newObs.date);
            let marker = plotObservation(selectedStormIds, newObs);

            // fly to the first marker 
            if (idx === 0) {
                map.current?.flyTo({ center: marker.getLngLat() })
            }

        }

    }

    // Update the GIBS source when the selectedDate changes
    const updateMapWhenDateChanges = (date: string) => {
        if (!map.current || !map.current.isStyleLoaded()) return;

        const source = map.current.getSource('gibs-tiles');

        // if (source && source.type === 'raster') {
        // Update the tiles URL with the new date

        // Update the tiles property
        // source.tiles = newTiles;

        // Mapbox GL JS does not automatically detect changes to the tiles array,
        // so you need to trigger a reload. One way is to use setTiles if available,
        // but if not, you might need to remove and re-add the source.

        // if (typeof source.setTiles === 'function') {
        //     source.setTiles(newTiles);
        // }
        if (source) {
            const newTiles = [getGIBSUrl(date)];
            // Remove the existing source and layer
            if (map.current.getLayer('gibs-layer')) {
                map.current.removeLayer('gibs-layer');
            }
            if (map.current.getSource('gibs-tiles')) {
                map.current.removeSource('gibs-tiles');
            }

            // Re-add the source with updated tiles
            map.current.addSource('gibs-tiles', {
                type: 'raster',
                tiles: newTiles,
                tileSize: 256,
                attribution: 'Imagery courtesy of NASA/GSFC',
            });

            // Re-add the layer
            map.current.addLayer({
                id: 'gibs-layer',
                type: 'raster',
                source: 'gibs-tiles',
                minzoom: 3,
                maxzoom: 9,
                // Uncomment to adjust opacity
                // paint: {
                //   'raster-opacity': 0.8
                // }
            });
        }

        console.log(`GIBS layer updated to date: ${date}`);
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
                    <DateSliderComponent sliderDates={getUniqueDatesOfStorm()} onDateChange={onDateChange} />
                </CardContent>
            </Card>
            <div ref={mapContainer} className="w-3/4" />
        </div>
    )
}