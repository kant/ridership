import SparkLine from '../sparkLine/sparkLine';

const atlasHelperFunctions = {
  getAllAgencies({
    nationalMapData,
  }) {
    return nationalMapData
      .reduce((accumulator, msa) => [...accumulator, ...msa.ta], [])
      .sort((a, b) => b.upt2017 - a.upt2017);
  },

  getMSAData({
    allNationalMapData,
    globalId,
  }) {
    return allNationalMapData.filter(msa => msa.globalId === globalId
     || msa.ta.map(ta => ta.globalId).includes(globalId))[0];
  },

  drawMSASparkline({
    msa,
    indicator,
    container,
    highlightedId,
  }) {
    const indicatorData = Object.assign({}, indicator);
    if (msa.globalId === highlightedId) {
      indicatorData.agencies = [{
        msaId: msa.msaId,
        globalId: msa.globalId,
        color: 'rgba(0,0,0,1)',
      }];
      indicatorData.agencies[0].summaries = msa.ntd.map((d) => {
        const { year } = d;
        const indicatorSummary = d[indicator.value];
        return {
          year,
          indicatorSummary,
        };
      });
    } else {
      indicatorData.agencies = msa.ta.map((ta) => {
        const {
          msaId,
          taId,
          globalId,
        } = ta;
        const agencyCopy = {
          msaId,
          taId,
          globalId,
        };
        agencyCopy.summaries = ta.ntd.map((d) => {
          const { year } = d;
          const indicatorSummary = d[indicator.value];
          return {
            year,
            indicatorSummary,
          };
        });
        const mean = d3.mean(agencyCopy.summaries, s => s.indicatorSummary);
        const stDev = d3.deviation(agencyCopy.summaries, s => s.indicatorSummary);
        const scale = stDev === undefined ? undefined : value => (value - mean) / stDev;
        Object.assign(agencyCopy, {
          mean,
          stDev,
          scale,
        });
        agencyCopy.color = globalId === highlightedId || msa.globalId === highlightedId ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,.25)';
        return agencyCopy;
      });
    }

    return new SparkLine({
      container,
      indicatorData,
      yearRange: [2006, 2017],
      color: true,
      interactive: false,
    });
  },
};

export default atlasHelperFunctions;
