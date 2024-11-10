// components/GibsMap.js
import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import Script from 'next/script';

const GibsMap = ({ center = [0, 0], zoom = 3, date = new Date() }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const layerRef = useRef(null);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // Initialize leaflet map after scripts are loaded
  useEffect(() => {
    if (!isLeafletLoaded) return;

    // Only create map if it doesn't exist
    if (!leafletMapRef.current) {
      const L = window.L;  // Get Leaflet from window object

      // Initialize map
      leafletMapRef.current = L.map(mapRef.current).setView(center, zoom);

      // Add OpenStreetMap as base layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMapRef.current);

      // Add GIBS layer
      layerRef.current = L.GIBSLayer('MODIS_Terra_CorrectedReflectance_TrueColor', {
        date: date,
        transparent: true
      }).addTo(leafletMapRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isLeafletLoaded, center, zoom, date]);

  // Update date when it changes
  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setDate(date);
    }
  }, [date]);

  return (
      <>
          <script src="GIBSLayer.js"></script>
          <script src="GIBSMetadata.js"></script>
      {/* Load required scripts */}
      {/* <Script 
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        onLoad={() => {
          // After Leaflet loads, load GIBS layers definition and plugin
          const gibsLayersScript = document.createElement('script');
          gibsLayersScript.src = '/gibs-layers.js'; // You'll need to create this
          gibsLayersScript.onload = () => {
            const gibsPluginScript = document.createElement('script');
            gibsPluginScript.src = '/GIBSLayer.js'; // The modified plugin code
            gibsPluginScript.onload = () => setIsLeafletLoaded(true);
            document.body.appendChild(gibsPluginScript);
          };
          document.body.appendChild(gibsLayersScript);
        }}
      /> */}
      
      {/* Map container */}
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '500px' }} 
      />
    </>
  );
};

export default GibsMap;