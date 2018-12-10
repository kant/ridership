const axisFunctions = {
  getXAxisGenerator({ xScale }) {
    return d3.axisBottom(xScale);
  },
  getYAxisGenerator({
    xScale,
    yScale,
  }) {
    const yScaleReversed = d3.scaleLinear()
      .domain(yScale.domain())
      .range([yScale.range()[1], yScale.range()[0]]);
    return d3.axisLeft(yScaleReversed)
      .tickSize(xScale.range()[1])
      .ticks(4);
  },
  updateNationalAverageText({
    nationalAverageText,
    nationalAverage,
  }) {
    const formatPercent = d3.format('.1%');
    nationalAverageText
      .text(`National Change: ${formatPercent(nationalAverage / 100)}`);
  },
};

const histogramFunctions = {
  getHistogramData({
    nationalMapData,
    bucketCount,
    nationalDataView,
  }) {
    const allAgencies = nationalDataView === 'msa' ? nationalMapData.slice()
      : nationalMapData
        .reduce((accumulator, msa) => [...accumulator, ...msa.ta], [])
        .filter(d => d.pctChange < 500);

    const nationalAverage = d3.mean(allAgencies, d => d.pctChange);

    const changeSpan = d3.extent(allAgencies, d => d.pctChange);

    const bucketSize = (changeSpan[1] - changeSpan[0]) / bucketCount;

    const histogramData = new Array(bucketCount)
      .fill(null)
      .map((d, i) => {
        const bucket = [
          changeSpan[0] + (i * bucketSize),
          changeSpan[0] + (i * bucketSize) + bucketSize,
        ];
        const agencies = allAgencies
          .filter((agency) => {
            if (i === 0) {
              return agency.pctChange >= bucket[0]
                && agency.pctChange - bucket[1] <= 0.00001;
            }
            return agency.pctChange > bucket[0]
              && agency.pctChange - bucket[1] <= 0.00001;
          });
        // const bucket = {};
        // bucket.index = i;
        return {
          bucket,
          records: agencies,
          count: agencies.length,
          index: i,
        };
      });
    return { histogramData, nationalAverage };
  },
  getScales({
    width,
    height,
    histogramData,
    padding,
  }) {
    const yDomain = [
      0,
      d3.max(histogramData, d => d.count) + (d3.max(histogramData, d => d.count) * 0.2),
    ];
    const yRange = [
      0,
      height - padding.top - padding.bottom,
    ];

    const xDomain = d3.extent(histogramData
      .reduce((accumular, d) => [...accumular, ...d.bucket], []));
    const xRange = [
      0,
      width - padding.left - padding.right,
    ];

    const xScale = d3.scaleLinear()
      .domain(xDomain)
      .range(xRange);
    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range(yRange);
    return {
      xScale,
      yScale,
    };
  },
  drawSVG({
    container,
    width,
    height,
  }) {
    return container
      .append('svg')
      .attr('class', 'histogram__svg')
      .styles({
        width: `${width}px`,
        height: `${height}px`,
      });
  },
  drawBars({
    svg,
    xScale,
    yScale,
    changeColorScale,
    padding,
    height,
    histogramData,
    barSpacing,
    updateHighlightedAgencies,
    dataProbe,
  }) {
    const count = histogramData.length;

    const rectWidth = ((xScale.range()[1] - xScale.range()[0]) / count) - barSpacing;

    return svg
      .selectAll('.histogram__bar')
      .data(histogramData, d => d.index)
      .enter()
      .append('rect')
      .attrs({
        y: d => (height - padding.bottom) - yScale(d.count),
        x: (d, i) => padding.left + ((rectWidth + barSpacing) * i),
        width: rectWidth,
        height: d => yScale(d.count),
        fill: d => changeColorScale((d.bucket[1] + d.bucket[0]) / 2),
        stroke: '#999999',
        'stroke-width': 1,
      })
      .on('mouseover', (d) => {
        updateHighlightedAgencies(d.records);
        const { clientX, clientY } = d3.event;
        const pos = {
          left: clientX < window.innerWidth - 260 ? (clientX + 10) : clientX - 260,
          bottom: window.innerHeight - clientY + 10,
          width: 250,
        };
        const html = `
          <div class="data-probe__row"><span class="data-probe__field">${d.records.length} transit authorit${d.records.length > 1 ? 'ies' : 'y'}</span></div>
          <div class="data-probe__row">${d.bucket.map(val => `${Math.round(val)}%`).join(' – ')}</div>
        `;
        dataProbe
          .config({
            pos,
            html,
          })
          .draw();
      })
      .on('mouseout', () => {
        updateHighlightedAgencies([]);
        dataProbe.remove();
      });
  },
  drawAxes({
    xScale,
    yScale,
    svg,
    padding,
    height,
  }) {
    const {
      getYAxisGenerator,
      getXAxisGenerator,
    } = axisFunctions;
    const xAxis = svg
      .append('g')
      .attrs({
        transform: `translate(${padding.left}, ${height - padding.bottom})`,
        class: 'histogram__axis',
      })
      .call(getXAxisGenerator({ xScale }));

    const yAxis = svg.append('g')
      .attrs({
        transform: `translate(${padding.left + xScale.range()[1]}, ${padding.top})`,
        class: 'histogram__axis',
      })
      .call(getYAxisGenerator({ xScale, yScale }));
    return { xAxis, yAxis };
  },
  drawAverageLine({
    svg,
    nationalAverage,
    xScale,
    padding,
    height,
  }) {
    const {
      updateNationalAverageText,
    } = axisFunctions;

    const nationalAverageGroup = svg
      .append('g')
      .attr('transform', `translate(${padding.left + xScale(nationalAverage)}, ${padding.top})`);

    const nationalAverageText = nationalAverageGroup
      .append('text')
      .attrs({
        class: 'histogram__average-text',
        'text-anchor': 'middle',
        x: 0,
        y: -8,
      });

    updateNationalAverageText({
      nationalAverageText,
      nationalAverage,
    });

    nationalAverageGroup
      .append('line')
      .attrs({
        class: 'histogram__average-line',
        y1: 0,
        y2: height - padding.bottom - padding.top,
        x1: 0,
        x2: 0,
      });
    return {
      nationalAverageGroup,
      nationalAverageText,
    };
  },
  updateAverageLine({
    nationalAverageGroup,
    nationalAverage,
    xScale,
    padding,
    nationalAverageText,
  }) {
    const {
      updateNationalAverageText,
    } = axisFunctions;

    updateNationalAverageText({
      nationalAverageText,
      nationalAverage,
    });

    nationalAverageGroup
      .style('opacity', 1)
      .transition()
      .duration(500)
      .attr('transform', `translate(${padding.left + xScale(nationalAverage)}, ${padding.top})`);
  },
  hideAverageLine({
    nationalAverageGroup,
  }) {
    nationalAverageGroup
      .style('opacity', 0);
  },
  updateAxes({
    xScale,
    yScale,
    xAxis,
    yAxis,
  }) {
    const {
      getYAxisGenerator,
      getXAxisGenerator,
    } = axisFunctions;

    yAxis.transition()
      .duration(500)
      .call(getYAxisGenerator({ xScale, yScale }));

    xAxis.transition()
      .duration(500)
      .call(getXAxisGenerator({ xScale }));
  },
  updateBars({
    bars,
    histogramData,
    yScale,
    changeColorScale,
    height,
    padding,
  }) {
    bars
      .data(histogramData, d => d.index)
      .transition()
      .duration(500)
      .attrs({
        height: d => yScale(d.count),
        y: d => (height - padding.bottom) - yScale(d.count),
        fill: d => changeColorScale((d.bucket[1] + d.bucket[0]) / 2),
        stroke: '#999999',
        'stroke-width': 1,
      });
  },
  updateNational({
    bars,
    changeColorScale,
    nationalMapData,
    bucketCount,
    padding,
    width,
    height,
    xAxis,
    nationalAverageGroup,
    nationalAverageText,
    yAxis,
    updateHighlightedAgencies,
    nationalDataView,
  }) {
    const {
      getHistogramData,
      updateBars,
      getScales,
      updateAxes,
      updateAverageLine,
    } = histogramFunctions;

    const {
      histogramData,
      nationalAverage,
    } = getHistogramData({
      nationalMapData,
      bucketCount,
      nationalDataView,
    });

    const { yScale, xScale } = getScales({
      padding,
      histogramData,
      width,
      height,
    });

    updateAxes({
      xScale,
      yScale,
      xAxis,
      yAxis,
    });

    updateBars({
      height,
      padding,
      bars,
      histogramData,
      yScale,
      changeColorScale,
      updateHighlightedAgencies,
    });

    updateAverageLine({
      nationalAverageGroup,
      nationalAverage,
      nationalAverageText,
      xScale,
      padding,
    });
  },
  getMSAHistogramData({
    tractGeo,
    bucketCount,
    currentCensusField,
  }) {
    const tracts = tractGeo.features.map(d => d.properties);
    const changeSpan = d3.extent(tracts, d => d[currentCensusField.value] * 100);

    const bucketSize = (changeSpan[1] - changeSpan[0]) / bucketCount;
    const msaHistogramData = new Array(bucketCount)
      .fill(null)
      .map((d, i) => {
        const bucket = [
          changeSpan[0] + (i * bucketSize),
          changeSpan[0] + (i * bucketSize) + bucketSize,
        ];
        const records = tracts
          .filter((tract) => {
            if (i === 0) {
              return tract[currentCensusField.value] * 100 >= bucket[0]
                && tract[currentCensusField.value] * 100 - bucket[1] <= 0.00001;
            }
            return tract[currentCensusField.value] * 100 > bucket[0]
              && tract[currentCensusField.value] * 100 - bucket[1] <= 0.00001;
          });
        // const bucket = {};
        // bucket.index = i;
        return {
          bucket,
          records,
          count: records.length,
          index: i,
        };
      });
    return msaHistogramData;
  },
  updateMSA({
    tractGeo,
    bucketCount,
    currentCensusField,
    padding,
    width,
    height,
    xAxis,
    yAxis,
    bars,
    nationalAverageGroup,
    changeColorScale,
  }) {
    const {
      getMSAHistogramData,
      getScales,
      updateAxes,
      updateBars,
      hideAverageLine,
    } = histogramFunctions;
    const histogramData = getMSAHistogramData({
      tractGeo,
      bucketCount,
      currentCensusField,
    });

    const { yScale, xScale } = getScales({
      padding,
      histogramData,
      width,
      height,
    });

    updateAxes({
      xScale,
      yScale,
      xAxis,
      yAxis,
    });

    updateBars({
      bars,
      histogramData,
      yScale,
      changeColorScale,
      height,
      padding,
    });

    hideAverageLine({
      nationalAverageGroup,
    });
  },
};

export default histogramFunctions;
