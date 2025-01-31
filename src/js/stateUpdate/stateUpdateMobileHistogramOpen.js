const getUpdateMobileHistogram = ({ components }) => function updateMobileHistogram() {
  const {
    histogram,
    layout,
  } = components;

  const mobileHistogramOpen = this.get('mobileHistogramOpen');

  layout.config({
    mobileHistogramOpen,
  })
    .updateHistogramToggle();
  histogram
    .config({
      mobileHistogramOpen,
    })
    .updateToggle();
};

export default getUpdateMobileHistogram;
