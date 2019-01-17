import getStateUpdateYears from './stateUpdateYears';
import getStateUpdateIndicator from './stateUpdateIndicator';
import getStateUpdateScale from './stateUpdateScale';
import getStateUpdateHighlightedAgencies from './stateUpdateHighlightedAgencies';
import getStateUpdateComparedAgencies from './stateUpdateComparedAgencies';
import getStateUpdateCompareMode from './stateUpdateCompareMode';
import getStateUpdateSearchResult from './stateUpdateSearchResult';
import getStateUpdateExpandedIndicator from './stateUpdateExpandedIndicator';
import getStateUpdateMSA from './stateUpdateMSA';
import getStateUpdateCensusField from './stateUpdateCensusField';
import getStateUpdateDistanceFilter from './stateUpdateDistanceFilter';
import getStateUpdateNationalDataView from './stateUpdateNationalDataView';
import getStateUpdateTAFilter from './stateUpdateTAFilter';
import getStateUpdateScreenSize from './stateUpdateScreenSize';
import getStateUpdateCurrentZoom from './stateUpdateCurrentZoom';
import getStateUpdateMSAScaleExtent from './stateUpdateMSAScaleExtent';
import getStateUpdateHighlightedTractValue from './stateUpdateHighlightedTractValue';

const initStateUpdateListeners = ({ components, data }) => {
  const { state } = components;

  state.registerCallbacks({
    years: getStateUpdateYears(({ components, data })),
    indicator: getStateUpdateIndicator({ components, data }),
    scale: getStateUpdateScale({ components, data }),
    msa: getStateUpdateMSA({ components, data }),
    highlightedAgencies: getStateUpdateHighlightedAgencies({ components, data }),
    highlightedTractValue: getStateUpdateHighlightedTractValue({ components, data }),
    expandedIndicator: getStateUpdateExpandedIndicator({ components, data }),
    comparedAgencies: getStateUpdateComparedAgencies({ components, data }),
    compareMode: getStateUpdateCompareMode({ components }),
    searchResult: getStateUpdateSearchResult({ components }),
    censusField: getStateUpdateCensusField({ components, data }),
    distanceFilter: getStateUpdateDistanceFilter({ components, data }),
    nationalDataView: getStateUpdateNationalDataView({ components }),
    taFilter: getStateUpdateTAFilter({ components, data }),
    screenSize: getStateUpdateScreenSize({ components }),
    currentZoom: getStateUpdateCurrentZoom({ components }),
    msaScaleExtent: getStateUpdateMSAScaleExtent({ components }),
  });
};

export default initStateUpdateListeners;
