// public/gibs-layers.js
L.GIBS_LAYERS = {
    'MODIS_Terra_CorrectedReflectance_TrueColor': {
      template: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg',
      zoom: 9,
      date: true
    },
    // Add other layer definitions as needed
  };
  
  L.GIBS_MASKS = {
    'MODIS_Terra_Data_No_Data': {
      template: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Data_No_Data/default/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png',
      zoom: 9,
      date: true
    },
    // Add other mask definitions as needed
  };