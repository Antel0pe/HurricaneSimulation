// GIBSTileLayer.tsx

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface Props {
    date?: string
    time?: string
    config: GIBS_TileLayerConfig
}

export interface GIBS_TileLayerConfig {
    layer: string,
    tileMatrixSet: string,
    image: string,
}

const GIBSTileLayer = ({ date = '2019-09-01', time = '17:00 UTC', config }: Props) => {
    const map = useMap();

    useEffect(() => {
        console.log(`${date} @ ${time}`)
        console.log(`${config.layer}`)
    }, [date, time, config])



    useEffect(() => {
        const template =
            'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/{layer}/default/{date}/{tileMatrixSet}/{z}/{y}/{x}.{image}';

        const layer = L.tileLayer(template, {
            layer: config.layer,
            tileMatrixSet: config.tileMatrixSet,
            tileSize: 512,
            subdomains: 'abc',
            noWrap: true,
            date: formatDateTime(date, time),
            image: config.image,
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
        return `${date}T${time.slice(0, 4 + 1)}:00Z`
    }

    return null;
};

export default GIBSTileLayer;
