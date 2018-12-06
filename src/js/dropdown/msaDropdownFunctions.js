const msaDropdownFunctions = {
  drawContent({
    msaList,
    contentContainer,
    updateMSA,
  }) {
    contentContainer
      .selectAll('.msa-dropdown__content-row')
      .data(msaList)
      .enter()
      .append('div')
      .attr('class', 'msa-dropdown__content-row')
      .on('click', updateMSA)
      .text(d => d.name);
  },
};

export default msaDropdownFunctions;
