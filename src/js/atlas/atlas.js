import atlasMethods from './atlasGeoFunctions';
import atlasNationalFunctions from './atlasNationalFunctions';
import DataProbe from '../dataProbe/dataProbe';

const privateProps = new WeakMap();

const privateMethods = {
  init() {
    const props = privateProps.get(this);

    const {
      mapContainer,
      width,
      height,
      statesTopo,
      nationalMapData,
      changeColorScale,
      dataProbe,
      jumpToMsa,
      updateHighlightedAgencies,
    } = props;

    const {
      drawMapSVG,
      getGeoProps,
      drawLayers,
      drawStates,
      getZoomed,
      setZoomEvents,
      getInitialScaleTranslate,
    } = atlasMethods;
    const {
      drawAgencies,
    } = atlasNationalFunctions;

    const {
      setRadiusScale,
      toggleNationalLayers,
    } = privateMethods;

    setRadiusScale.call(this);

    const {
      radiusScale,
    } = props;

    const {
      geoPath,
      projection,
      projectionModify,
    } = getGeoProps({ width, height });

    const {
      initialTranslate,
      initialScale,
    } = getInitialScaleTranslate({ projection });

    const mapSVG = drawMapSVG({
      mapContainer,
      width,
      height,
    });

    const layers = drawLayers({
      mapSVG,
    });

    const states = drawStates({
      layer: layers.states,
      statesTopo,
      geoPath,
    });


    const agencies = drawAgencies({
      jumpToMsa,
      radiusScale,
      dataProbe,
      layer: layers.agencies,
      nationalMapData,
      projection,
      changeColorScale,
      projectionModify,
      updateHighlightedAgencies,
      logSimulationNodes: (nodes) => {
        props.nodes = nodes;
      },
    });

    const zoomed = getZoomed({
      states,
      // agencies,
      getAgencies: () => props.agencies,
      initialScale,
      initialTranslate,
      projectionModify,
      geoPath,
      setCurrentTransform: (newTransform) => {
        props.transform = newTransform;
      },
    });

    setZoomEvents({
      zoomed,
      mapSVG,
    });


    Object.assign(props, {
      states,
      agencies,
      layers,
      mapSVG,
      projection,
      projectionModify,
      radiusScale,
    });

    toggleNationalLayers.call(this);
  },
  setRadiusScale() {
    const props = privateProps.get(this);
    const { nationalMapData } = props;

    const { getRadiusScale } = atlasMethods;

    props.radiusScale = getRadiusScale({ nationalMapData });
  },
  drawMSA() {
    const {
      msa,
      tractData,
      layers,
    } = privateProps.get(this);
  },
  toggleNationalLayers() {
    const {
      layers,
      scale,
    } = privateProps.get(this);
    const {
      nationalView,
      msaView,
    } = layers;
    nationalView
      .classed('map__hidden-layer', scale === 'msa');

    msaView
      .classed('map__hidden-layer', scale === 'national');
  },
};

class Atlas {
  constructor(config) {
    const mapContainer = d3.select('.atlas__map-container');
    const {
      width,
      height,
    } = mapContainer.node().getBoundingClientRect();
    privateProps.set(this, {
      mapContainer,
      width,
      height,
      statesTopo: null,
      layers: null,
      nationalMapData: null,
      dataProbe: new DataProbe({
        container: d3.select('.outer-container'),
      }),
    });
    const {
      init,
    } = privateMethods;

    this.config(config);

    init.call(this);
  }

  config(config) {
    Object.assign(privateProps.get(this), config);
    return this;
  }

  updateYears() {
    const props = privateProps.get(this);
    // const {
    //   setRadiusScale,
    // } = privateMethods;

    // setRadiusScale.call(this);

    const {
      nationalMapData,
      // radiusScale,
      agencies,
      nodes,
      changeColorScale,
    } = props;
    const {
      // drawAgencies,
      // updateAgencyRadii,
      setAgencyColors,
    } = atlasMethods;

    // updateAgencyRadii({
    //   nationalMapData,
    //   radiusScale,
    //   agencies,
    //   nodes,
    //   changeColorScale,
    // });
    setAgencyColors({
      agencies,
      changeColorScale,
      nationalMapData,
      nodes,
      // radiusScale,
    });
  }

  updateNationalMapData() {
    const props = privateProps.get(this);
    const {
      nationalMapData,
      changeColorScale,
      agencies,
      nodes,
      // radiusScale,
    } = props;
    const {
      // drawAgencies,
      setAgencyColors,
    } = atlasMethods;

    setAgencyColors({
      agencies,
      changeColorScale,
      nationalMapData,
      nodes,
      // radiusScale,
    });
  }

  updateScale() {
    const props = privateProps.get(this);
    const {
      scale,
    } = props;
    const {
      drawMSA,
      toggleNationalLayers,
    } = privateMethods;

    if (scale === 'msa') {
      drawMSA.call(this);
      toggleNationalLayers.call(this);
    }
  }

  updateHighlight() {
    const {
      agencies,
      highlightedAgencies,
    } = privateProps.get(this);

    agencies.classed('highlight', (d) => {
      const highlightIds = highlightedAgencies.map(agency => agency.taId);
      return highlightIds.includes(d.taId);
    });
  }
}

export default Atlas;
