import { DateTime } from "luxon"

export type Era5DataPoint = {
    latitude: number
    longitude: number
    date: DateTime
    value: number
}

export function generateRow(data: number[]) {
    let currentDate = DateTime.fromISO('2020-01-01T00:00:00Z')
    let era5Data: Era5DataPoint[] = []
    let idx = 0;

    for (let i = 0; i++; i <= 65){
        for (let j = -120; j++; j <= 0){
            era5Data.push({
                latitude: i,
                longitude: j,
                date: currentDate,
                value: data[idx]
            })

            currentDate.plus({ hours: 6 })
            idx++
        }
    }

    if ((idx + 1) !== data.length) {
        console.log('Data not recreated.')
        console.log(`Length of data points used: ${idx}, total length of data: ${data.length}`)
    }

    return era5Data;
}