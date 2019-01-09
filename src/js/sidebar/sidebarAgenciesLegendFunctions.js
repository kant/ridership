const sidebarLegendFunctions = {
  drawMSASparkLineLegend({
    // contentContainer,
    taFilter,
    updateTAFilter,
    logTAChecks,
    currentAgencies,
    legendContainer,
  }) {
    const {
      setSparkLineLegendChecks,
    } = sidebarLegendFunctions;


    // const legendContainer = d3.select('.sidebar__agency-legend');
    // .append('div')
    // .attr('class', 'sidebar__sparkline-legend-container');
    console.log('currentAgencies', currentAgencies);

    const rowContainers = legendContainer
      .selectAll('.sidebar__sparkline-legend-row-outer')
      .data(currentAgencies)
      .enter()
      .append('div')
      .attr('class', 'sidebar__sparkline-legend-row-outer');

    const rows = rowContainers
      .append('div')
      .attr('class', 'sidebar__sparkline-legend-row');
      // .text(d => d.taName);

    const rowsLeft = rows.append('div')
      .attr('class', 'sidebar__sparkline-legend-row-left');

    const rowsRight = rows.append('div')
      .attr('class', 'sidebar__sparkline-legend-row-right');

    const dropdownButtons = rowsLeft.append('div')
      .attr('class', 'sidebar__sparkline-legend-dropdown-container')
      .append('div')
      .attr('class', 'sidebar__sparkline-legend-dropdown-button')
      .html(`
        <i class="fas fa-caret-right"></i>
        <i class="fas fa-caret-down"></i>
      `);

    rowsLeft.append('div')
      .attr('class', 'sidebar__sparkline-legend-check')
      .on('click', (d) => {
        updateTAFilter(d.taId);
      });

    const subAgencyContainers = rowContainers
      .append('div')
      .attr('class', 'sidebar__sparkline-legend-sub-agencies');
    subAgencyContainers
      .each(function drawSubAgencies(d) {
        d3.select(this)
          .selectAll('.sidebar__sparkline-legend-sub-agency')
          .data(d.subTa)
          .enter()
          .append('div')
          .attr('class', 'sidebar__sparkline-legend-sub-agency')
          .text(dd => dd.taName);
      });

    const checks = legendContainer.selectAll('.sidebar__sparkline-legend-check');

    logTAChecks(checks);

    rowsLeft.append('div')
      .attr('class', 'sidebar__sparkline-legend-text')
      .text(d => d.taName);
    const swatchWidth = 12;
    const swatchHeight = 12;
    rowsRight.append('div')
      .attr('class', 'sidebar__sparkline-legend-swatch-container')
      .append('svg')
      .styles({
        width: `${swatchWidth}px`,
        height: `${swatchHeight}px`,
      })
      .append('rect')
      .attrs({
        width: swatchWidth,
        height: swatchHeight,
        x: 0,
        y: 0,
        fill: d => d.color,
      });

    setSparkLineLegendChecks({
      checks,
      taFilter,
    });
  },
  setSparkLineLegendChecks({
    checks,
    taFilter,
  }) {
    checks.html((d) => {
      if (taFilter.has(d.taId)) {
        return '<i class="fas fa-square"></i>';
      }
      return '<i class="fas fa-check-square"></i>';
    });
  },
  clearLegend({
    legendContainer,
  }) {
    legendContainer
      .selectAll('.sidebar__sparkline-legend-row-outer')
      .remove();
  },
};

export default sidebarLegendFunctions;
