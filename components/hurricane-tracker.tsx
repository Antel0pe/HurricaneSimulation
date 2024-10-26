'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Note: In a real application, you should use environment variables for API keys
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'

// Mock weather data (you would replace this with real API calls)
const getWeatherData = (lat: number, lon: number) => ({
  temp: Math.round(75 + Math.random() * 15),
  pressure: Math.round(980 + Math.random() * 40),
  windSpeed: Math.round(50 + Math.random() * 100),
  humidity: Math.round(70 + Math.random() * 30)
})

export function HurricaneTrackerComponent() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ lat: number, lon: number } | null>(null)

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-60, 25], // Centered on the Atlantic
      zoom: 3
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add grid overlay
      for (let lat = 10; lat <= 40; lat += 5) {
        for (let lon = -90; lon <= -30; lon += 5) {
          const id = `grid-${lat}-${lon}`;
          map.current.addSource(id, {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'Polygon',
                'coordinates': [[
                  [lon, lat],
                  [lon + 5, lat],
                  [lon + 5, lat + 5],
                  [lon, lat + 5],
                  [lon, lat]
                ]]
              }
            }
          });

          map.current.addLayer({
            'id': id,
            'type': 'fill',
            'source': id,
            'layout': {},
            'paint': {
              'fill-color': 'rgba(255, 255, 255, 0.1)',
              'fill-outline-color': 'rgba(255, 255, 255, 0.5)'
            }
          });

          map.current.on('click', id, (e) => {
            if (e.features && e.features[0].geometry.type === 'Polygon') {
              const coords = e.features[0].geometry.coordinates[0][0];
              setSelectedCell({ lat: coords[1], lon: coords[0] });
            }
          });

          map.current.on('mouseenter', id, () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer';
          });

          map.current.on('mouseleave', id, () => {
            if (map.current) map.current.getCanvas().style.cursor = '';
          });
        }
      }
    });

    // Clean up on unmount
    return () => map.current?.remove();
  }, []);

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Hurricane Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapContainer} className="w-full h-[500px] mb-4" style={{ position: 'relative' }} />
        {selectedCell && (
          <Card>
            <CardHeader>
              <CardTitle>Weather Data for {selectedCell.lat.toFixed(2)}°N, {Math.abs(selectedCell.lon).toFixed(2)}°W</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Temperature: {getWeatherData(selectedCell.lat, selectedCell.lon).temp}°F</p>
              <p>Pressure: {getWeatherData(selectedCell.lat, selectedCell.lon).pressure} hPa</p>
              <p>Wind Speed: {getWeatherData(selectedCell.lat, selectedCell.lon).windSpeed} mph</p>
              <p>Humidity: {getWeatherData(selectedCell.lat, selectedCell.lon).humidity}%</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}