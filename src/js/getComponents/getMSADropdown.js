import MSADropdown from '../dropdown/msaDropdown';

const getMSADropdown = ({ data, state }) => new MSADropdown({
  dropdownOpen: false,
  toggleButton: d3.select('.header__msa-dropdown-text'),
  currentMSA: state.get('msa'),
  msaList: [
    {
      name: 'National Average',
      msaId: 'average',
    },
    ...data.get('msa'),
  ],
  contentOuterContainer: d3.select('.msa-dropdown__content-container'),
  contentContainer: d3.select('.msa-dropdown__content'),
  mobileSelect: d3.select('.header__jump-to-container select'),
  updateMSA: (newMSA) => {
    const currentMSA = state.get('msa');
    const currentScale = state.get('scale');

    if (newMSA.msaId === 'average' && currentScale === 'national') return;
    if (newMSA.msaId === 'average' && currentScale !== 'national') {
      state.set('msa', null);
      state.update({
        scale: 'national',
      });
      return;
    }
    if (currentMSA === null || currentMSA.msaId !== newMSA.msaId) {
      if (state.get('scale') === 'national') {
        const years = state.get('years');
        if (years[0] < 2010 || years[1] > 2016) {
          state.update({ years: [d3.max([2010, years[0]]), d3.min([2016, years[1]])] });
        }
        state.update({
          scale: 'msa',
          msa: newMSA,

        });
      } else {
        state.update({
          msa: newMSA,
        });
      }
    }
  },
});

export default getMSADropdown;
