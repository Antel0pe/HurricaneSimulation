// ProjCRSMap.tsx
"use client"

import React, { useEffect } from 'react';
import { MapContainer, useMap, WMSTileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4';
import 'proj4leaflet';
import GIBSTileLayer from './testGIBS';

type Props = {
    children?: React.ReactNode,
  }

const EPSG4326Map = ( { children }: Props) => {
    // Define the custom CRS using proj4leaflet
    const EPSG4326 = new L.Proj.CRS(
        'EPSG:4326',
        '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs',
        {
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
                0.002197265625,
            ],
            bounds: L.bounds([-180, -90], [180, 90]),
        }
    );

    return (
        <MapContainer
            center={[0, 0]}
            zoom={2}
            maxZoom={8}
            crs={EPSG4326}

            style={{ height: '100vh', width: '100%' }}
        >
            
            { children }
        </MapContainer>
    );
};

export default EPSG4326Map;
