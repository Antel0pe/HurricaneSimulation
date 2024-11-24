import React from 'react';
import HeatmapLayer from './heatmap-layer';
import { HurricaneDataLayer } from './hurricane-layer-selector';
import MSLHeatmapLayer from './MSL_Heatmap_layer';

export const availableLayers: HurricaneDataLayer[] = [
    {
        id: "temp",
        name: "Temperature Heatmap"
    },
    {
        id: "msl",
        name: "Mean Sea Level Pressure Heatmap"
    },
]


const LayerManager = ({
    selectedLayer,
    displayedDate,
    displayedTime
}: {
    selectedLayer: HurricaneDataLayer | null;
    displayedDate: string;
    displayedTime: string;
}) => {
    const renderLayer = () => {
        if (!selectedLayer) return null;

        switch (selectedLayer.id) {
            case 'temp':
                return <HeatmapLayer date={displayedDate} time={displayedTime} />;
            case 'msl':
                return <MSLHeatmapLayer date={displayedDate} time={displayedTime} />;
            default:
                return null;
        }
    };

    return <>{renderLayer()}</>;
};

export default LayerManager;