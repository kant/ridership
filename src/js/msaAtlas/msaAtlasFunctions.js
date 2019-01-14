const msaAtlasFunctions = {
  drawAtlas({
    msaMapContainer,
    msa,
    tractGeo,
    currentCensusField,
    logInitialFilters,
    updateAgencyLayers,
    // scaleExtent,
    onZoom,
    saveCamera,
    setMinScale,
    // getCurrentCamera,
    dataProbe,
  }) {
    let lastFeatureId = null;
    const {
      initSite,
    } = msaAtlasFunctions;
    const msaAtlas = new mapboxgl.Map({
      container: msaMapContainer.node(),
      style: 'mapbox://styles/axismaps/cjnvwmhic2ark2sp7fmjuwhf7',
      center: [-71.038412, 42.355046],
      zoom: 10.5,
      // minZoom: scaleExtent[0],
      // maxZoom: scaleExtent[1],
      preserveDrawingBuffer: true,
    })
      .on('mousemove', 'tract-fill', (d) => {
        const feature = msaAtlas.queryRenderedFeatures(d.point)[0];
        const offset = 15;
        const containerPos = d3.select('.atlas__msa-map-container')
          .node()
          .getBoundingClientRect();
        const pos = {
          left: d.point.x + offset + containerPos.left,
          bottom: (window.innerHeight - d.point.y - containerPos.top) + offset,
          width: 200,
        };
        if (feature.properties.id !== lastFeatureId && feature.layer.id === 'tract-fill') {
          lastFeatureId = feature.properties.id;
          dataProbe.remove();

          const html = `<div>${feature.properties.id}</div>`;
          dataProbe
            .config({
              pos,
              html,
            })
            .draw();
        } else {
          dataProbe.setPos(pos);
        }
      })
      .on('mouseleave', 'tract-fill', () => {
        dataProbe.remove();
      })
      .on('zoom', () => {
        onZoom(msaAtlas.getZoom());
      })
      .on('load', () => {
        initSite({
          saveCamera,
          msaAtlas,
          msa,
          tractGeo,
          currentCensusField,
          setMinScale,
        });
        // const camera = getCurrentCamera();
        // setMinScale(camera.zoom);
        logInitialFilters(msaAtlas.getStyle());
        msaMapContainer
          .classed('atlas__msa-map-container--loaded', true);
        updateAgencyLayers();
      });

    return msaAtlas;
  },
  initSite({
    msaAtlas,
    msa,
    tractGeo,
    currentCensusField,
    saveCamera,
    setMinScale,
  }) {
    const {
      jumpToMSA,
      drawTracts,
    } = msaAtlasFunctions;

    jumpToMSA({
      msaAtlas,
      msa,
      saveCamera,

      setMinScale,
    });
    drawTracts({
      msaAtlas,
      tractGeo,
      currentCensusField,
    });
  },
  jumpToMSA({
    msaAtlas,
    msa,
    saveCamera,
    setMinScale,
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
    saveCamera(camera);
    setMinScale(camera.zoom);
    msaAtlas.setMaxBounds(null);
    msaAtlas.jumpTo(camera);
    msaAtlas.setMaxBounds(msaAtlas.getBounds());
  },
  drawTracts({
    msaAtlas,
    tractGeo,
    currentCensusField,

  }) {
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
        'fill-color': ['get', `${currentCensusField.value}-color`],
        'fill-opacity': 0.5,
      },
    };
    msaAtlas.addLayer(tractLayer, 'building');
  },
};

export default msaAtlasFunctions;
