import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet.heat';
import Papa from 'papaparse';
import { DateTime } from 'luxon';

interface RowData {
    latitude: number;
    longitude: number;
    valid_time: string;
    msl: number;
    sst: number;
    vertical_wind_shear: number;
    relative_humidity: number;
    vorticity: number;
}

type Props = {
    datetime: DateTime
}

const SimplePredictHurricaneLayer = ({ datetime }: Props) => {
    const map = useMap();
    const [rowData, setRowData] = useState<RowData[]>([]);
    const [displayRows, setDisplayRows] = useState<RowData[]>([]);
    const [currentDateTime, setCurrentDateTime] = useState<DateTime>(DateTime.fromISO('2020-09-01T00:00:00Z'));

    useEffect(() => {
        setCurrentDateTime(datetime);
    }, [datetime]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fileName = 'era5ForAllLatLongOnHurDat2ObservationDates.csv';
                const response = await fetch(fileName);

                if (!response.ok) {
                    throw new Error('Failed to fetch data from file ' + fileName);
                }

                const csvText = await response.text();
                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setRowData(results.data as RowData[]);
                    },
                    error: (error: any) => {
                        console.error('Error parsing CSV:', error);
                    }
                });
            } catch (err) {
                console.log('Error loading data: ' + err);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let rows = rowData.filter((r) => {
            let rowDatetime = DateTime.fromFormat(r.valid_time, 'yyyy-MM-dd HH:mm:ss')
            return (
                datetime.year === rowDatetime.year &&
                datetime.month === rowDatetime.month &&
                datetime.day === rowDatetime.day &&
                datetime.hour === rowDatetime.hour
            );
        })

        console.log(rows)

        setDisplayRows(rows);
    }, [datetime])

    useEffect(() => {
        if (!map || !displayRows.length) return;

        // Prepare heatmap data: [lat, lng, intensity]
        const heatData: Array<[number, number, number]> = displayRows
            .map((row, idx) => {
                return [row.latitude, row.longitude, 1];
            }
            );

        // Create the heat layer
        const heatLayer = L.heatLayer(heatData, {
            radius: 20,
            maxZoom: 5,
            // gradient: {
            //     0.0: '#FF00FF', // Magenta
            //     0.1: '#FF0099', // Magenta-Pink
            //     0.2: '#FF0044', // Magenta-Red
            //     0.3: '#FF0000', // Red
            //     0.4: '#FF5500', // Red-Orange
            //     0.5: '#FFA500', // Orange
            //     0.6: '#FFD700', // Orange-Yellow
            //     0.7: '#FFFF00', // Yellow
            //     0.8: '#80FF80', // Yellow-Green
            //     0.9: '#0080FF', // Cyan-Blue
            //     1.0: '#0000FF'  // Blue
            // },
            // blur: 15,
            // max: 0.8,
            // minOpacity: 0.4
        });

        // Add the heat layer to the map
        heatLayer.addTo(map);

        // Cleanup function
        return () => {
            heatLayer.removeFrom(map);
        };
    }, [displayRows, map]);

    return null;
};

export default SimplePredictHurricaneLayer;