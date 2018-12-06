import * as topojson from 'topojson-client';

const msaAtlasFunctions = {
  drawAtlas({
    msaMapContainer,
    msa,
    tractGeo,
  }) {
    const {
      drawSite,
    } = msaAtlasFunctions;
    const msaAtlas = new mapboxgl.Map({
      container: msaMapContainer.node(),
      style: 'mapbox://styles/axismaps/cjnvwmhic2ark2sp7fmjuwhf7',
      center: [-71.038412, 42.355046],
      zoom: 10.5,
    })
      .on('load', () => {
        drawSite({
          msaAtlas,
          msa,
          tractGeo,
        });
        msaMapContainer
          .classed('atlas__msa-map-container--loaded', true);
      });

    return msaAtlas;
  },
  drawSite({
    msaAtlas,
    msa,
    tractGeo,
  }) {
    const {
      jumpToMSA,
      drawTracts,
    } = msaAtlasFunctions;

    jumpToMSA({
      msaAtlas,
      msa,
    });
    drawTracts({
      msaAtlas,
      tractGeo,
    });
  },
  jumpToMSA({
    msaAtlas,
    msa,
  }) {
    const {
      maxX,
      maxY,
      minX,
      minY,
    } = msa;
    const sw = new mapboxgl.LngLat(minX, minY);
    const ne = new mapboxgl.LngLat(maxX, maxY);
    const bounds = new mapboxgl.LngLatBounds(sw, ne);
    const camera = msaAtlas.cameraForBounds(bounds);
    msaAtlas.jumpTo(camera);
  },
  drawTracts({
    msaAtlas,
    tractGeo,
  }) {
    console.log('tractGeo', tractGeo);
    const currentTractSource = msaAtlas.getSource('tracts');
    if (currentTractSource === undefined) {
      msaAtlas.addSource('tracts', {
        type: 'geojson',
        data: tractGeo,
      });
    } else {
      msaAtlas.removeLayer('tract-fill');
      currentTractSource.setData(tractGeo);
    }
    const tractLayer = {
      id: 'tract-fill',
      type: 'fill',
      source: 'tracts',
      layout: {},
      paint: {
        'fill-color': 'orange',
        'fill-opacity': 0.2,
      },
    };
    msaAtlas.addLayer(tractLayer);
  },
};

export default msaAtlasFunctions;
