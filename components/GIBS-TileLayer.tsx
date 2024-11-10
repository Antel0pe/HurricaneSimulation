import { useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import GIBSPreloadTileLayer from './GIBSPreloadTileLayer';

interface Props {
    date?: string
    time?: string
    config: GIBS_TileLayerConfig
    preloadDays?: number
}

export interface GIBS_TileLayerConfig {
    layer: string,
    tileMatrixSet: string,
    image: string,
}

const GIBSTileLayer = ({ 
    date = '2019-09-01', 
    time = '17:00 UTC', 
    config,
    preloadDays = 10 
}: Props) => {
    const map = useMap();

    useEffect(() => {
        const template =
            'https://gibs-{s}.earthdata.nasa.gov/wmts/epsg4326/best/{layer}/default/{date}/{tileMatrixSet}/{z}/{y}/{x}.{image}';

        const layerOptions = {
            layer: config.layer,
            tileMatrixSet: config.tileMatrixSet,
            tileSize: 512,
            subdomains: 'abc',
            noWrap: true,
            date: `${date}T${time.slice(0, 4 + 1)}:00Z`,
            time: time,
            image: config.image,
            continuousWorld: true,
            bounds: [
                [-89.9999, -179.9999],
                [89.9999, 179.9999],
            ],
            attribution: 'NASA EOSDIS GIBS | View Source',
        } as L.TileLayerOptions;

        // const layer = new L.TileLayer(template, layerOptions);
        // layer.addTo(map);
        
        // @ts-ignore
        const layer = new L.GIBSLayer('MODIS_Aqua_SurfaceReflectance_Bands721', {
            date: new Date('2015/04/01'),
            transparent: true
        }).addTo(map);

        // const layer = new GIBSPreloadTileLayer(template, layerOptions);
        // layer.addTo(map);

        // Initial preload
        // layer.preloadTiles(preloadDays);

        // // Preload on map movements
        // const handleMapChange = () => {
        //     layer.preloadTiles(preloadDays);
        // };

        // map.on('moveend', handleMapChange);
        // map.on('zoomend', handleMapChange);

        // // Update date and clean cache when date changes
        // layer.updateDate(date, time);

        return () => {
            map.removeLayer(layer);
            // map.off('moveend', handleMapChange);
            // map.off('zoomend', handleMapChange);
        };
    }, [map, date, time, config, preloadDays]);

    return null;
};

export default GIBSTileLayer;