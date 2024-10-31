'use client'

import React, { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet';
import 'proj4leaflet';
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { AutocompleteSearchComponent } from './autocomplete-search'
import { DateSliderComponent } from './date-slider'

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
    const map = useRef<L.Map | null>(null)
    const gibsLayerRef = useRef<L.TileLayer | null>(null)
    const markersRef = useRef<L.Layer[]>([])
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

        // let EPSG4326 = new L.Proj.CRS(
        //     'EPSG:4326',
        //     '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs', {
        //     origin: [-180, 90],
        //     resolutions: [
        //         0.5625,
        //         0.28125,
        //         0.140625,
        //         0.0703125,
        //         0.03515625,
        //         0.017578125,
        //         0.0087890625,
        //         0.00439453125,
        //         0.002197265625
        //     ],
        //     bounds: new L.Bounds([
        //         [-180, -90],
        //         [180, 90]
        //     ])
        // }
        // );

        // map.current = L.map('map', {
        //     center: [0, 0],
        //     zoom: 2,
        //     maxZoom: 8,
        //     crs: EPSG4326,
        //     maxBounds: [
        //         [-120, -220],
        //         [120, 220]
        //     ]
        // });



        // // Add base map layer
        // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        //     attribution: '&copy; OpenStreetMap contributors',
        // }).addTo(map.current);

        // let template =
        //     'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/{layer}/default/{date}/{tileMatrixSet}/{z}/{y}/{x}.{image}';
        // // '//gibs-{s}.earthdata.nasa.gov/wmts/epsg4326/best/' +
        // // '{layer}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg';

        // let layer = L.tileLayer(template, {
        //     layer: 'GOES-East_ABI_Band13_Clean_Infrared',
        //     tileMatrixSet: '2km',
        //     // time: '2013-11-04',
        //     tileSize: 512,
        //     subdomains: 'abc',
        //     noWrap: true,
        //     date: '2019-09-01T17:00:00Z',
        //     image: 'png',
        //     continuousWorld: true,
        //     // Prevent Leaflet from retrieving non-existent tiles on the
        //     // borders.
        //     bounds: [
        //         [-89.9999, -179.9999],
        //         [89.9999, 179.9999]
        //     ],
        //     attribution:
        //         '<a href="https://wiki.earthdata.nasa.gov/display/GIBS">' +
        //         'NASA EOSDIS GIBS</a>&nbsp;&nbsp;&nbsp;' +
        //         '<a href="https://github.com/nasa-gibs/web-examples/blob/main/examples/leaflet/geographic-epsg4326.js">' +
        //         'View Source' +
        //         '</a>'
        // } as TileLayerOptions);

        // map?.current.addLayer(layer);

        // // Add GIBS layer
        // gibsLayerRef.current = L.tileLayer(getGIBSUrl(), {
        //     attribution: 'Imagery courtesy of NASA/GSFC',
        //     tileSize: 256,
        //     // Other options if necessary
        // }).addTo(map.current)

        console.log('map is being set')

        return () => {
            map.current?.remove()
        }
    }, [loading, error])

    useEffect(() => {
        console.log('should be removed')
        removeStormMarkers()
        addStormMarkers()
    }, [selectedStormIds])

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
        // return `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/250m/{z}/{y}/{x}.jpg`;

        return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpeg`;
    }

    const removeStormMarkers = () => {
        if (!map.current) return
        markersRef.current.forEach(marker => {
            map.current!.removeLayer(marker)
        })
        markersRef.current = []
    }

    const addStormMarkers = () => {
        if (!map.current) return

        removeStormMarkers()

        let newMarkersLatLong: number[][] = []

        let filteredStorms = getStorm(selectedStormIds)
        filteredStorms.forEach(storm => {
            storm.observations.forEach(obs => {
                newMarkersLatLong.push([obs.latitude, obs.longitude])
                let marker = plotObservation(storm.name, obs)
                markersRef.current.push(marker)
            })
        })

        return newMarkersLatLong
    }

    const plotObservation = (stormName: string, obs: StormObservation) => {
        const popupContent = `<h3>${stormName}</h3>
            <p>Date: ${obs.date}</p>
            <p>Time: ${obs.time}</p>
            <p>Wind Speed: ${obs.wind_speed} knots</p>
            <p>Pressure: ${obs.pressure === -999 ? 'N/A' : obs.pressure + ' mb'}</p>`

        const marker = L.circleMarker([obs.latitude, obs.longitude], {
            color: getColorForWindSpeed(obs.wind_speed),
            fillColor: getColorForWindSpeed(obs.wind_speed),
            radius: 6,
            fillOpacity: 1,
            weight: 1,
        })
            .bindPopup(popupContent)
            .addTo(map.current!)

        return marker
    }

    const createStormName = (data: StormData) => {
        return data.name + ' ' + data.storm_id
    }

    const getStorm = (name: string) => {
        return stormData.filter((storm) => name.includes(createStormName(storm)))
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
        let dates = getStorm(selectedStormIds).flatMap((s) => s.observations).map((s) => s.date)
        let uniqueDates: string[] = Array.from(new Set(dates))
        return uniqueDates
    }

    const onDateChange = (idx: number) => {
        let filteredStorms = getStorm(selectedStormIds)[0]

        if (filteredStorms) {
            let newObs = filteredStorms.observations[idx]
            updateMapWhenDateChanges(newObs.date)
            let marker = plotObservation(selectedStormIds, newObs)

            // fly to the first marker
            if (idx === 0) {
                map.current?.setView([newObs.latitude, newObs.longitude], map.current.getZoom())
            }
        }
    }

    // Update the GIBS source when the selectedDate changes
    const updateMapWhenDateChanges = (date: string) => {
        if (!map.current) return

        // Remove existing GIBS layer if any
        if (gibsLayerRef.current) {
            map.current.removeLayer(gibsLayerRef.current)
        }

        // Add new GIBS layer with updated date
        gibsLayerRef.current = L.tileLayer(getGIBSUrl(date), {
            attribution: 'Imagery courtesy of NASA/GSFC',
            tileSize: 256,
            // Other options if necessary
        }).addTo(map.current)

        console.log(`GIBS layer updated to date: ${date}`)
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
            <div ref={mapContainer} id='map' className="w-3/4" />
        </div>
    )
}

window.onload = function () {
    console.log('??dsa?')
    var EPSG4326 = new L.Proj.CRS(
        'EPSG:4326',
        '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs', {
        origin: [-180, 90],
        resolutions: [
            0.5625,
            0.28125,
            0.140625,
            0.0703125,
            0.03515625,
            0.017578125,
            0.0087890625,
            0.00439453125,
            0.002197265625
        ],
        // Values are x and y here instead of lat and long elsewhere.
        bounds: new L.Bounds([
            [-180, -90],
            [180, 90]
        ])
    }
    );
    console.log('proj')

    var map = L.map('map', {
        center: [0, 0],
        zoom: 2,
        maxZoom: 8,
        crs: EPSG4326,
        maxBounds: [
            [-120, -220],
            [120, 220]
        ]
    });
    console.log('hope?')

    var template =
        'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/{layer}/default/{date}/{tileMatrixSet}/{z}/{y}/{x}.{image}';
    // '//gibs-{s}.earthdata.nasa.gov/wmts/epsg4326/best/' +
    // '{layer}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.jpg';

    var layer = L.tileLayer(template, {
        layer: 'GOES-East_ABI_Band13_Clean_Infrared',
        tileMatrixSet: '2km',
        // time: '2013-11-04',
        tileSize: 512,
        subdomains: 'abc',
        noWrap: true,
        date: '2019-09-01T17:00:00Z',
        image: 'png',
        continuousWorld: true,
        // Prevent Leaflet from retrieving non-existent tiles on the
        // borders.
        bounds: [
            [-89.9999, -179.9999],
            [89.9999, 179.9999]
        ],
        attribution:
            '<a href="https://wiki.earthdata.nasa.gov/display/GIBS">' +
            'NASA EOSDIS GIBS</a>&nbsp;&nbsp;&nbsp;' +
            '<a href="https://github.com/nasa-gibs/web-examples/blob/main/examples/leaflet/geographic-epsg4326.js">' +
            'View Source' +
            '</a>'
    } as L.TileLayerOptions);
    console.log('should be setting proj map')

    map.addLayer(layer);
};