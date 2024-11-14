import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import Script from 'next/script';

const HeatmapLayer = ({ data }: { data: { lat: number; lng: number; intensity: number }[] }) => {
  const map = useMap();

  useEffect(() => {
    const heatData = data.map((point) => [point.lat, point.lng, point.intensity]  as L.LatLngTuple);
    const heatLayer = L.heatLayer(heatData, { radius: 25, maxZoom: 5 });
    map.addLayer(heatLayer);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [data, map]);

  return null;
};

const HurricanePressureMap: React.FC = () => {
  const pressureData = [
    { lat: 29.5, lng: -95.3, intensity: 0.8 },
    { lat: 28.0, lng: -94.5, intensity: 0.6 },
    // Add more pressure data points
  ];

  return (
    <>
      <Script src="https://unpkg.com/leaflet.heat/dist/leaflet-heat.js" strategy="beforeInteractive" />
      <MapContainer center={[29.5, -95.3]} zoom={5} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <HeatmapLayer data={pressureData} />
      </MapContainer>
    </>
  );
};

export default HurricanePressureMap;
