// src/MyTileLayer.ts
import * as L from 'leaflet';

/**
 * MyTileLayer extends Leaflet's TileLayer to create a custom tile layer.
 */
class MyTileLayer extends L.TileLayer {
    /**
     * Constructor for MyTileLayer.
     * @param urlTemplate - The URL template for the tile images.
     * @param options - Optional Leaflet TileLayer options.
     */
    constructor(urlTemplate: string, options?: L.TileLayerOptions) {
        super(urlTemplate, options);
        // Initialize any custom properties or methods here
    }

    /**
     * Example of a custom method.
     */
    public myCustomMethod(): void {
        console.log('MyTileLayer custom method called');
        // Add custom behavior here
    }

    /**
 * Generates a tile URL by replacing placeholders in the template.
 * @param template - The tile URL template with placeholders.
 * @param options - The tile layer options containing necessary parameters.
 * @param date - The specific date string to replace '{date}'.
 * @param x - The x-coordinate of the tile.
 * @param y - The y-coordinate of the tile.
 * @param z - The zoom level.
 * @returns The fully constructed tile URL.
 */
    public generateTileUrl(
        template: string,
        layer: string,
        tileMatrixSet: string,
        subdomains: string,
        image: string,
        date: string,
        x: number,
        y: number,
        z: number
    ): string {
        // Select a random subdomain
        const s = subdomains[Math.floor(Math.random() * subdomains.length)];

        return template
            .replace('{s}', s)
            .replace('{layer}', layer)
            .replace('{date}', `${date}T00:00:00Z`) // Assuming time is fixed at '00:00:00Z'
            .replace('{tileMatrixSet}', tileMatrixSet)
            .replace('{z}', z.toString())
            .replace('{x}', x.toString())
            .replace('{y}', y.toString())
            .replace('{image}', image);
    }

    public preloadTilesForFutureDates(
        map: L.Map,
        template: string,
        layer: string,
        tileMatrixSet: string,
        subdomains: string,
        image: string,
        futureDates: string[],
        buffer: number = 5
    ): void {
        const zoom: number = map.getZoom();
        const tileSize: L.Point = this.getTileSize();

        // Get map bounds in tile coordinates
        const bounds: L.LatLngBounds = map.getBounds();
        const nwPoint: L.Point = map.project(bounds.getNorthWest(), zoom).divideBy(tileSize.x).floor();
        const sePoint: L.Point = map.project(bounds.getSouthEast(), zoom).divideBy(tileSize.x).floor();


        // Define the range of tiles to preload
        const preloadBounds: L.Bounds = L.bounds(
            [nwPoint.x - buffer, nwPoint.y - buffer],
            [sePoint.x + buffer, sePoint.y + buffer]
        );

        // Type guards to ensure preloadBounds.min and preloadBounds.max are defined
        if (!preloadBounds.min?.x || !preloadBounds.max) {
            console.error('Preload bounds are undefined.');
            return;
        }

        // Maximum number of tiles per axis at the current zoom level
    const maxTiles = Math.pow(2, zoom);

    // Clamp function to restrict values within min and max
    const clamp = (value: number, min: number, max: number): number => {
        return Math.max(min, Math.min(max, value));
    };

        const minX: number = clamp(preloadBounds.min!.x, 0, maxTiles - 1);
        const minY: number = clamp(preloadBounds.min!.y, 0, maxTiles - 1);
        const maxX: number = clamp(preloadBounds.max!.x, 0, maxTiles - 1);
        const maxY: number = clamp(preloadBounds.max!.y, 0, maxTiles - 1);

        const tileUrlsToPreload: string[] = [];
        

        // Iterate over each future date
        futureDates.forEach((date) => {
            // Iterate through the tile range
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    // Optional: Validate tile coordinates based on zoom level
                    const maxTiles = Math.pow(2, zoom);
                    if (x < 0 || x >= maxTiles || y < 0 || y >= maxTiles) {
                        continue; // Skip invalid tile coordinates
                    }

                    // Generate the tile URL by replacing placeholders
                    let tileUrl: string = this.generateTileUrl(template, layer,
                        tileMatrixSet,
                        subdomains,
                        image, date, x, y, zoom);

                    // Replace the '{date}' placeholder with the formatted date
                    // NO TIME OPTION - ALWAYS DEFAULT TO MIDNIGHT TIME
                    // console.log(`before replacing, ${tileUrl}`)
                    // tileUrl = tileUrl.replace(
                    //     '{date}',
                    //     `${date}T00:00:00Z`
                    // );
                    // console.log(`replaced url ${tileUrl}`)

                    // Preload the tile by creating an Image object
                    // const img: HTMLImageElement = new Image();
                    // img.src = tileUrl;

                    // // Optional: Handle load and error events
                    // img.onload = () => {
                    //     // console.log(`Preloaded tile: ${tileUrl}`);
                    // };
                    // img.onerror = () => {
                    //     // console.error(`Failed to preload tile: ${tileUrl}`);
                    // };
                    tileUrlsToPreload.push(tileUrl);
                }
            }
        });

        // Send tile URLs to the Service Worker for caching
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            console.log(`using service worker? ${tileUrlsToPreload}`)
            navigator.serviceWorker.controller.postMessage({
                type: 'PRELOAD_TILES',
                tileUrls: tileUrlsToPreload,
            });
        }
    }




    // You can override existing methods from TileLayer if needed
    // For example:
    // public getTileUrl(coords: L.Coords): string {
    //     // Customize the tile URL generation
    //     return super.getTileUrl(coords);
    // }
}

// Factory function for easy instantiation
function myTileLayer(urlTemplate: string, options?: L.TileLayerOptions): MyTileLayer {
    return new MyTileLayer(urlTemplate, options);
}

// Extend Leaflet's TileLayer namespace to include the factory method
declare module 'leaflet' {
    namespace TileLayer {
        function myTileLayer(urlTemplate: string, options?: TileLayerOptions): MyTileLayer;
    }
}

// Attach the factory function to Leaflet's TileLayer
L.TileLayer.myTileLayer = myTileLayer;

// Export the class and factory function if needed elsewhere
export { MyTileLayer, myTileLayer };
export default MyTileLayer;
