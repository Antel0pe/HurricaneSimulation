"use client"

import React, { useEffect, useState } from 'react';
import { MapContainer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import 'proj4leaflet';

export type EPSG4326Map_Props = {
    children?: React.ReactNode,
}

const EPSG4326Map = ({ children }: EPSG4326Map_Props) => {
    const [proj, setProj] = useState<L.Proj.CRS | null>(null)
    // Define the custom CRS using proj4leaflet

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Dynamically import 'proj4leaflet' only on the client
            import('proj4leaflet').then(() => {
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

                setProj(EPSG4326)
            }).catch(err => {
                console.error("Failed to load proj4leaflet:", err);
            });
        }

    }, [])

    if (!proj) {
        return <div>Loading map...</div>;
    }

    return (
        <MapContainer
            center={[0, 0]}
            zoom={2}
            maxZoom={8}
            crs={proj}

            style={{ height: '100vh', width: '100%' }}
        >

            {children}
        </MapContainer>
    );
};

export default EPSG4326Map;
