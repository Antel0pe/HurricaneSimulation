// src/leaflet-heat.d.ts
import * as L from 'leaflet';

declare module 'leaflet' {
    function heatLayer(
        latlngs: L.LatLngExpression[],
        options?: {
            minOpacity?: number;
            maxZoom?: number;
            radius?: number;
            blur?: number;
            max?: number;
            gradient?: object;

        }
    ): L.Layer;
}
