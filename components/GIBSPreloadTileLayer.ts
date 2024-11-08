import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Extend TileLayer to add preloading capabilities
class GIBSPreloadTileLayer extends L.TileLayer {
    private tileCache: Map<string, Promise<HTMLImageElement>>;
    private currentDate: string;
    private currentTime: string;

    constructor(urlTemplate: string, options: L.TileLayerOptions) {
        super(urlTemplate, options);
        this.tileCache = new Map();
        this.currentDate = options.date as string;
        this.currentTime = options.time as string;
    }

    // Override _createTile to integrate with the caching system
    createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
        const tile = document.createElement('img');
        
        tile.setAttribute('role', 'presentation');
        
        // Standard Leaflet event handling
        L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
        L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile));

        // Get tile URL
        const url = this.getTileUrl(coords);

        // Check cache or load tile
        this.loadTileFromCacheOrNetwork(url)
            .then((imgData) => {
                if (tile.parentNode) { // Check if tile is still in DOM
                    tile.src = imgData.src;
                }
            })
            .catch((error) => {
                console.error('Tile load error:', error);
                this._tileOnError.call(this, done, tile, error);
            });

        return tile;
    }

    private async loadTileFromCacheOrNetwork(url: string): Promise<HTMLImageElement> {
        // Check if we have a cached promise for this URL
        let tilePromise = this.tileCache.get(url);
        
        if (!tilePromise) {
            // Create new promise for loading the tile
            tilePromise = new Promise((resolve, reject) => {
                const img = new Image();
                
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = url;
            });
            
            this.tileCache.set(url, tilePromise);
        }
        
        return tilePromise;
    }

    // Method to preload tiles for future dates
    async preloadTiles(preloadDays: number): Promise<void> {
        if (!this._map) return;

        const bounds = this._map.getBounds();
        const zoom = this._map.getZoom();
        
        // Get tile coordinates for current view
        const tileBounds = L.bounds(
            this._map.project(bounds.getNorthWest(), zoom).divideBy(512).floor(),
            this._map.project(bounds.getSouthEast(), zoom).divideBy(512).ceil()
        );

        // Generate URLs for future dates
        for (let i = 1; i <= preloadDays; i++) {
            const futureDate = this.getNextDate(this.currentDate, i);
            const formattedDate = this.formatDateTime(futureDate, this.currentTime);

            for (let x = tileBounds.min.x; x <= tileBounds.max.x; x++) {
                for (let y = tileBounds.min.y; y <= tileBounds.max.y; y++) {
                    const coords = {
                        x,
                        y,
                        z: zoom
                    };

                    const url = this._getPreloadUrl(coords, formattedDate);
                    
                    // Only preload if not already in cache
                    if (!this.tileCache.has(url)) {
                        this.loadTileFromCacheOrNetwork(url).catch(() => {
                            // Silently handle preload failures
                            this.tileCache.delete(url);
                        });
                    }
                }
            }
        }
    }

    private _getPreloadUrl(coords: {x: number, y: number, z: number}, date: string): string {
        const data = {
            r: L.Browser.retina ? '@2x' : '',
            s: this._getSubdomain(coords),
            x: coords.x,
            y: coords.y,
            z: coords.z,
            date: date,
            layer: this.options.layer,
            tileMatrixSet: this.options.tileMatrixSet,
            image: this.options.image
        };
        
        return L.Util.template(this._\url, {...data});
    }

    private getNextDate(currentDate: string, daysToAdd: number): string {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + daysToAdd);
        return date.toISOString().split('T')[0];
    }

    private formatDateTime(date: string, time: string): string {
        return `${date}T${time.slice(0, 4 + 1)}:00Z`;
    }

    // Method to update current date and clean cache
    updateDate(newDate: string, newTime: string): void {
        this.currentDate = newDate;
        this.currentTime = newTime;
        this.clearOutdatedCache();
    }

    // Clean up tiles that are no longer needed
    private clearOutdatedCache(): void {
        const maxAge = 7; // Keep week-old tiles
        const cutoffDate = this.getNextDate(this.currentDate, -maxAge);

        for (const [url] of this.tileCache) {
            const dateMatch = url.match(/default\/(.*?)\//);
            if (dateMatch && dateMatch[1] < cutoffDate) {
                this.tileCache.delete(url);
            }
        }
    }
}

export default GIBSPreloadTileLayer;