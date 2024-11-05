const https = require('https');
const { DOMParser } = require('@xmldom/xmldom');

https.get('https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/1.0.0/WMTSCapabilities.xml', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(data, 'text/xml');

        const layers = xmlDoc.getElementsByTagName('Layer');
        const layerInfo = [];

        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];

            const resourceURLs = layer.getElementsByTagName('ResourceURL');
            const hasImageResource = Array.from(resourceURLs).some(url => {
                const format = url.getAttribute('format');
                return format && (
                    format.includes('image')
                );
            });

            if (hasImageResource) {
                const identifier = layer.getElementsByTagName('ows:Identifier')[0]?.textContent;
                const resourceURL = layer.getElementsByTagName('ResourceURL')[0]?.getAttribute('template');
                const imageType = resourceURL.slice(resourceURL.lastIndexOf('.')+1)

                // Get time range
                const dimension = layer.getElementsByTagName('Dimension')[0];
                const timeRange = dimension?.getElementsByTagName('Value')[0]?.textContent;
                let timeSplitRange = []
                if (timeRange) {
                    timeSplitRange = timeRange.split('/');
                }

                // Get TileMatrixSet info
                const tileMatrixSetLink = layer.getElementsByTagName('TileMatrixSetLink')[0];
                const tileMatrixSet = tileMatrixSetLink?.getElementsByTagName('TileMatrixSet')[0]?.textContent;

                if (identifier && resourceURL) {
                    layerInfo.push({
                        name: identifier,
                        url: resourceURL,
                        timeStartRange: timeSplitRange.length >= 2 ? timeSplitRange[0] : 'No time range specified',
                        timeEndRange: timeSplitRange.length >= 2 ? timeSplitRange[1] : 'No time range specified',
                        tileMatrixSet: tileMatrixSet || 'No tile matrix set specified',
                        image: imageType
                    });
                }
            }
        }

        console.log('Found layers:', layerInfo);
        console.log('Last layers: ', layerInfo.slice(-10))
        console.log('Total image layers found:', layerInfo.length);
    });
}).on('error', (err) => {
    console.error('Error fetching XML:', err);
});