import CompareDropdown from '../dropdown/compareDropdown';

const getCompareDropdown = ({ state, data }) => new CompareDropdown({
  compareMode: false,
  comparedAgencies: state.get('comparedAgencies'),
  nationalMapData: data.get('allNationalMapData'),
  updateComparedAgencies: (newCompare) => {
    const comparedAgencies = state.get('comparedAgencies');
    const nationalDataView = state.get('nationalDataView');
    let matches = newCompare.length === comparedAgencies.length;
    if (matches) {
      newCompare.forEach((ta, i) => {
        if (comparedAgencies[i].globalId !== ta.globalId) matches = false;
      });
    }
    const updateList = matches ? [] : newCompare;
    state.update({ compareMode: updateList.length > 0 });
    state.update({ comparedAgencies: updateList });
  },
  updateNationalDataView: (newView) => {
    const nationalDataView = state.get('nationalDataView');
    if (newView !== nationalDataView) {
      state.update({ nationalDataView: newView });
    }
  },
  dropdownOpen: false,
  toggleButton: d3.select('.atlas__compare-dropdown-button'),
  toggleButtonText: d3.select('.atlas__compare-dropdown-button-text'),
  contentOuterContainer: d3.select('.compare-dropdown__content-container'),
  contentContainer: d3.select('.compare-dropdown__content'),
});

export default getCompareDropdown;
