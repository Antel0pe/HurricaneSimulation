"use client"

import { AutocompleteSearchComponent } from "@/components/autocomplete-search";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { useState, useEffect, useCallback } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import EPSG4326Map from "@/components/EPSG4326Map";
import GIBSTileLayer, { GIBS_TileLayerConfig } from "@/components/GIBS-TileLayer";
import { WMSTileLayer } from "react-leaflet";
import { StormMarkers } from "@/components/StormMarkers";
import { Switch } from "@/components/ui/switch";
import { InfiniteDateSliderComponent } from "@/components/infinite-date-slider";
import { PlayHurricaneMarkers } from "@/components/playHurricaneMarkers";
import MapWrapper from "@/components/map-wrapper";
import dynamic from "next/dynamic";




// because i cant be bothered to figure this out rn
const Page = dynamic(() => import("../components/map-wrapper"), { ssr: false });

export default function Home() {
    return <Page />
}
