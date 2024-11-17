import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet.heat';

// FeatureProperties Interface
interface FeatureProperties {
    valid_time: string;           // ISO 8601 date-time string
    temperature: string;          // Temperature as a string (e.g., "-22.23")
    latitude: number;             // Latitude coordinate
    longitude: number;            // Longitude coordinate
    merged_count: number;         // Number indicating merged count
    temp_bucket: string;          // Temperature bucket range (e.g., "-22.5°C to -22.0°C")
    lower_bound_temp: string;     // Lower bound of temperature
    upper_bound_temp: string;     // Upper bound of temperature
}

// FeatureGeometry Interface
interface FeatureGeometry {
    type: "Polygon";
    coordinates: number[][][]; // Array of Linear Rings, each Linear Ring is an array of [longitude, latitude] pairs
}

// GeoJSONFeature Interface
interface GeoJSONFeature {
    type: "Feature";
    properties: FeatureProperties;
    geometry: FeatureGeometry;
}

interface TemperatureData {
    type: string,
    name: string,
    crs: object
    features: GeoJSONFeature[]
}


const HeatmapLayer = () => {
    const map = useMap();
    const [temperatureData, setTemperatureData] = useState<TemperatureData | undefined>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/temperature_20200101_000000_merged.geojson')
                if (!response.ok) {
                    throw new Error('Failed to fetch temperature data')
                }
                const data: TemperatureData = await response.json()
                console.log(data)
                setTemperatureData(data)
            } catch (err) {
                console.log('Error loading temperature data: ' + err)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (!map || !temperatureData) return;

        // Prepare heatmap data: [lat, lng, intensity]
        const heatData: Array<[number, number, number]> = temperatureData.features.map(
            (feature) => {
                const { latitude, longitude, temperature } = feature.properties;
                const tempNumber = parseFloat(temperature);

                // Normalize temperature to a positive intensity value
                // Assuming temperature ranges from -50°C to 50°C
                const minTemp = -50;
                const maxTemp = 50;
                let intensity = (tempNumber - minTemp) / (maxTemp - minTemp);

                // Clamp intensity between 0 and 1
                intensity = Math.max(0, Math.min(1, intensity));

                return [latitude, longitude, intensity];
            }
        );

        // Create the heat layer
        const heatLayer = L.heatLayer(heatData, {
            radius: 25,       // Radius of each "point" of the heatmap
            maxZoom: 5,       // Zoom level where the points reach maximum intensity
            // Optional: Customize gradient
            // gradient: {
            //     0.0: 'blue',
            //     0.5: 'lime',
            //     1.0: 'red',
            // },
            // Optional: Adjust opacity
            // opacity: 0.6,
        });

        // Add the heat layer to the map
        heatLayer.addTo(map);

        // Cleanup function to remove the heat layer when component unmounts or data changes
        return () => {
            heatLayer.removeFrom(map);
        };
    }, [temperatureData]);

    return null;
}

export default HeatmapLayer;
