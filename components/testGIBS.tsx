// GIBSTileLayer.tsx

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const GIBSTileLayer: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const template =
      'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/{layer}/default/{date}/{tileMatrixSet}/{z}/{y}/{x}.{image}';

    const layer = L.tileLayer(template, {
      layer: 'GOES-East_ABI_Band13_Clean_Infrared',
      tileMatrixSet: '2km',
      tileSize: 512,
      subdomains: 'abc',
      noWrap: true,
      date: '2019-09-01T17:00:00Z',
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
  }, [map]);

  return null;
};

export default GIBSTileLayer;
