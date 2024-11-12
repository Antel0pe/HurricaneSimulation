"use client"

import { StormData } from "@/app/page"
import { StormMarkers } from "./StormMarkers"
import { useEffect, useState } from "react"


type Props = {
    stormData: StormData[]
    displayedDate: string
    displayedTime: string
}

export function PlayHurricaneMarkers({ stormData, displayedDate, displayedTime }: Props) {
    const [currentlyOccurringHurricanes, setCurrentlyOccurringHurricanes] = useState<StormData[]>([]);

    useEffect(() => {
        setCurrentlyOccurringHurricanes(getActiveHurricanes(stormData, displayedDate, displayedTime))
    }, [stormData, displayedDate, displayedTime])

    function getActiveHurricanes(
        stormDataArray: StormData[],
        displayedDate: string,
        displayedTime: string
    ): StormData[] {
        // Combine displayedDate and displayedTime into a single ISO string in UTC
        const currentTime = new Date(`${displayedDate}T${displayedTime}Z`);

        // Validate the currentTime
        if (isNaN(currentTime.getTime())) {
            throw new Error(`Invalid displayed date or time: ${displayedDate} ${displayedTime}`);
        }

        return stormDataArray
            .filter((storm): storm is StormData => {
                if (!storm.observations || storm.observations.length === 0) {
                    return false;
                }

                // Sort observations by datetime ascending
                const sortedObservations = [...storm.observations].sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time.replace(' UTC', '')}Z`).getTime();
                    const dateB = new Date(`${b.date}T${b.time.replace(' UTC', '')}Z`).getTime();
                    return dateA - dateB;
                });

                const firstObservation = sortedObservations[0];
                const lastObservation = sortedObservations[sortedObservations.length - 1];

                const firstTime = new Date(`${firstObservation.date}T${firstObservation.time.replace(' UTC', '')}Z`);
                const lastTime = new Date(`${lastObservation.date}T${lastObservation.time.replace(' UTC', '')}Z`);

                // Validate the firstTime and lastTime
                if (isNaN(firstTime.getTime()) || isNaN(lastTime.getTime())) {
                    console.warn(`Invalid observation dates for storm ID: ${storm.storm_id}`);
                    return false;
                }

                // Check if currentTime is within the storm's active period
                return currentTime >= firstTime && currentTime <= lastTime;
            })
            .map((storm): StormData => {
                // Filter observations up to currentTime
                const relevantObservations = storm.observations
                    .filter((obs): boolean => {
                        const obsTime = new Date(`${obs.date}T${obs.time.replace(' UTC', '')}Z`);
                        return obsTime <= currentTime;
                    })
                    .sort((a, b) => {
                        const dateA = new Date(`${a.date}T${a.time.replace(' UTC', '')}Z`).getTime();
                        const dateB = new Date(`${b.date}T${b.time.replace(' UTC', '')}Z`).getTime();
                        return dateA - dateB;
                    });

                return {
                    ...storm,
                    observations: relevantObservations,
                };
            });
    }

    return (
        <div>
            {currentlyOccurringHurricanes.map((storm, idx) => {
                return (
                    <StormMarkers key={storm.name + storm.storm_id} stormObservations={storm.observations} stormId={storm.storm_id} stormName={storm.name} />
                )
            })}
        </div>
    )
}
