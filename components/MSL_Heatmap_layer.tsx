import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet.heat';
import Papa from 'papaparse';

interface MSLData {
    lat_rounded: number;
    lon_rounded: number;
    valid_time: string;
    msl: number;
}

type Props = {
    date: string;
    time: string;
}

const MSLHeatmapLayer = ({ date, time }: Props) => {
    const map = useMap();
    const [pressureData, setPressureData] = useState<MSLData[]>([]);
    const [currentDate, setCurrentDate] = useState('2020-05-01');
    const [currentTime, setCurrentTime] = useState('00:00');

    useEffect(() => {
        setCurrentDate(date);
        // setCurrentTime(time);
        setCurrentTime("00:00");
    }, [date, time]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fileName = formatFileForDateTime(currentDate, currentTime);
                console.log('Fetching MSL data from file ' + fileName);
                const response = await fetch(fileName);

                if (!response.ok) {
                    throw new Error('Failed to fetch MSL data from file ' + fileName);
                }

                const csvText = await response.text();
                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        setPressureData(results.data as MSLData[]);
                    },
                    error: (error: any) => {
                        console.error('Error parsing CSV:', error);
                    }
                });
            } catch (err) {
                console.log('Error loading MSL data: ' + err);
            }
        };

        fetchData();
    }, [currentDate, currentTime]);

    useEffect(() => {
        if (!map || !pressureData.length) return;

        const pressures = pressureData
            .filter(d => !isNaN(d.msl))
            .map(d => d.msl);

        const minPressure = Math.min(...pressures);
        const maxPressure = Math.max(...pressures);

        // Calculate mean and standard deviation for better distribution
        const mean = pressures.reduce((a, b) => a + b, 0) / pressures.length;
        const stdDev = Math.sqrt(
            pressures.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / pressures.length
        );

        console.log(`Pressure stats:
            Min: ${minPressure}
            Max: ${maxPressure}
            Mean: ${mean}
            StdDev: ${stdDev}`);

        const sortedData = pressureData.filter(d => !isNaN(d.msl)).sort((a, b) => a.msl - b.msl);


        // Prepare heatmap data: [lat, lng, intensity]
        const heatData: Array<[number, number, number]> = sortedData
            .map((dataPoint, idx) => {
                let intensity = parseFloat((idx / sortedData.length).toFixed(5))
                return [dataPoint.lat_rounded, dataPoint.lon_rounded, getIntensityValue(dataPoint.msl, minPressure, maxPressure)];
            }
            );

        // Create the heat layer
        const heatLayer = L.heatLayer(heatData, {
            radius: 20,
            maxZoom: 5,
            gradient: {
                0.0: '#FF00FF', // Magenta
                0.1: '#FF0099', // Magenta-Pink
                0.2: '#FF0044', // Magenta-Red
                0.3: '#FF0000', // Red
                0.4: '#FF5500', // Red-Orange
                0.5: '#FFA500', // Orange
                0.6: '#FFD700', // Orange-Yellow
                0.7: '#FFFF00', // Yellow
                0.8: '#80FF80', // Yellow-Green
                0.9: '#0080FF', // Cyan-Blue
                1.0: '#0000FF'  // Blue
            },
            blur: 15,
            // max: 0.8,
            // minOpacity: 0.4
        });

        // Add the heat layer to the map
        heatLayer.addTo(map);

        // Cleanup function
        return () => {
            heatLayer.removeFrom(map);
        };
    }, [pressureData]);

    function formatFileForDateTime(dateString: string, timeString: string) {
        const [year, month, day] = dateString.split('-');
        const [hours, minutes] = timeString.split(':');

        const formattedDate = `${year}-${month}-${day}`;
        const formattedTime = `${hours}`;

        return `local_data/msl_csv/msl_${formattedDate}_${formattedTime}.csv`;
    }

    function getIntensityValue(val: number, min: number, max: number) {
        if (val <= min) return 0; // Low pressure
        if (val >= max) return 1; // High pressure
        // Linear interpolation for mid-range
        return (max - val) / (max - min);
    }

    return null;
};

export default MSLHeatmapLayer;