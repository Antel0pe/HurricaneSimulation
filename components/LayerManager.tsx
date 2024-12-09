import React from 'react';
import HeatmapLayer from './heatmap-layer';
import { HurricaneDataLayer } from './hurricane-layer-selector';
import MSLHeatmapLayer from './MSL_Heatmap_layer';
import { DateTime } from 'luxon';
import SimplePredictHurricaneLayer from './simple-hurricane-predictor-layer';

export const availableLayers: HurricaneDataLayer[] = [
    {
        id: "temp",
        name: "Temperature Heatmap"
    },
    {
        id: "msl",
        name: "Mean Sea Level Pressure Heatmap"
    },
    {
        id: "simple-predict-hurricanes",
        name: "Simple Hurricane Predictor"
    },
]


const LayerManager = ({
    selectedLayer,
    displayedDate,
    displayedTime,
    displayedDateTime,
}: {
    selectedLayer: HurricaneDataLayer | null;
    displayedDate: string;
    displayedTime: string;
    displayedDateTime: DateTime;
}) => {
    const renderLayer = () => {
        if (!selectedLayer) return null;

        switch (selectedLayer.id) {
            case 'temp':
                return <HeatmapLayer date={displayedDate} time={displayedTime} />;
            case 'msl':
                return <MSLHeatmapLayer date={displayedDate} time={displayedTime} />;
            case 'simple-predict-hurricanes':
                return <SimplePredictHurricaneLayer datetime={displayedDateTime} />;
            default:
                return null;
        }
    };

    return <>{renderLayer()}</>;
};

export default LayerManager;