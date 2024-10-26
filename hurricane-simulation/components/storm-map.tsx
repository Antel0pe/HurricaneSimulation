'use client'

import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { AutocompleteSearchComponent } from './autocomplete-search'

// Note: Replace with your actual Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? '';

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
  const map = useRef<mapboxgl.Map | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [minWindSpeed, setMinWindSpeed] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [stormData, setStormData] = useState<StormData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
    const [filtersApplied, setFiltersApplied] = useState(false)
    const [selectedStormIds, setSelectedStormIds] = useState<string[]>([]);

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

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [-75, 35], // Centered on the Atlantic
      zoom: 3
    })

    return () => {
      map.current?.remove()
    }
  }, [loading, error])

  const addStormMarkers = () => {
    if (!map.current) return

    // Remove existing markers
    const existingMarkers = document.getElementsByClassName('mapboxgl-marker')
    while (existingMarkers[0]) {
      existingMarkers[0].remove()
    }

    if (!filtersApplied) return // Don't add markers if filters haven't been applied

    stormData.forEach(storm => {
      storm.observations.forEach(obs => {
        if (
          (!startDate || obs.date >= startDate) &&
          (!endDate || obs.date <= endDate) &&
          storm.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3>${storm.name}</h3>
             <p>Date: ${obs.date}</p>
             <p>Time: ${obs.time}</p>
             <p>Wind Speed: ${obs.wind_speed} knots</p>
             <p>Pressure: ${obs.pressure === -999 ? 'N/A' : obs.pressure + ' mb'}</p>`
          )

          new mapboxgl.Marker({
            color: getColorForWindSpeed(obs.wind_speed)
          })
            .setLngLat([obs.longitude, obs.latitude])
            .setPopup(popup)
            .addTo(map.current!)
        }
      })
    })
  }

  const getColorForWindSpeed = (windSpeed: number): string => {
    if (windSpeed < 64) return '#00ff00' // Tropical Storm
    if (windSpeed < 83) return '#ffff00' // Category 1
    if (windSpeed < 96) return '#ffa500' // Category 2
    if (windSpeed < 113) return '#ff0000' // Category 3
    if (windSpeed < 137) return '#ff00ff' // Category 4
    return '#800080' // Category 5
  }

  const handleSearch = () => {
    setFiltersApplied(true)
    addStormMarkers()
  }

  const handleReset = () => {
    setSearchTerm('')
    setMinWindSpeed(0)
    setStartDate('')
    setEndDate('')
    setFiltersApplied(false)
    addStormMarkers() // This will clear all markers
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
              <AutocompleteSearchComponent items={['a', 'b', 'c']} setSelected={setSelectedStormIds}/>
            </div>
            {/* <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div> */}
            {/* <div className="flex space-x-2">
              <Button onClick={handleSearch} className="flex-1">Apply Filters</Button>
              <Button onClick={handleReset} variant="outline" className="flex-1">Reset</Button>
            </div> */}
          </div>
        </CardContent>
      </Card>
      <div ref={mapContainer} className="w-3/4" />
    </div>
  )
}