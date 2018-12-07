const getStateUpdateCensusField = ({ components }) => function updateCensusField() {
  const censusField = this.get('censusField');
  const {
    censusDropdown,
    msaAtlas,
  } = components;
  // const msa = this.get('msa');
  // const years = this.get('years');


  censusDropdown
    .config({
      indicator: censusField,
    })
    .update();

  msaAtlas
    .config({
      currentCensusField: censusField,
    })
    .updateData();
};

export default getStateUpdateCensusField;