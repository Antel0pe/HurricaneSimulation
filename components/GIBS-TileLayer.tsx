// GIBSTileLayer.tsx

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface Props {
    date?: string
    time?: string
}

const stuff = [
    {
        layer: 'MODIS_Combined_MAIAC_L2G_ColumnWaterVapor',
        tileMatrixSet: '1km',
        image: 'png',

    },
    {
        layer: 'AMSRU2_Surface_Precipitation_Day',
        tilematrixset:'2km',
        image: 'png',
    },
    {
        layer: 'MODIS_Aqua_Water_Vapor_5km_Day',
        tileMatrixSet: '2km',
        image: 'png',
    }
]

const GIBSTileLayer = ({ date = '2019-09-01', time='17:00 UTC' }: Props) => {
    const map = useMap();

    useEffect(() => {
        console.log(`${date} @ ${time}`)
    }, [date, time])

    useEffect(() => {
        const template =
            'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/{layer}/default/{date}/{tileMatrixSet}/{z}/{y}/{x}.{image}';

        const layer = L.tileLayer(template, {
            layer: 'MODIS_Aqua_Water_Vapor_5km_Day',
            tileMatrixSet: '2km',
            tileSize: 512,
            subdomains: 'abc',
            noWrap: true,
            date: formatDateTime(date, time),
            image: 'png',
            continuousWorld: true,
            bounds: [
                [-89.9999, -179.9999],
                [89.9999, 179.9999],
            ],
            attribution:
                '<a href="https://wiki.earthdata.nasa.gov/display/GIBS">' +
                'NASA EOSDIS GIBS</a>&nbsp;&nbsp;&nbsp;' +
                '<a href="https://github.com/nasa-gibs/web-examples/blob/main/examples/leaflet/geographic-epsg4326.js">' +
                'View Source' +
                '</a>',
        } as L.TileLayerOptions);

        layer.addTo(map);

        return () => {
            map.removeLayer(layer);
        };
    }, [map, date, time]);



    const formatDateTime = (date: string, time: string) => {
        return `${date}T${time.slice(0, 4+1)}:00Z`
    }

    return null;
};

export default GIBSTileLayer;
