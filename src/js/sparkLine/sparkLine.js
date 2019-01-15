import sparkLineFunctions from './sparkLineFunctions';

const privateProps = new WeakMap();

const privateMethods = {
  init() {
    const props = privateProps.get(this);
    const {
      container,
      indicatorData,
      width,
      height,
      yearRange,
      dataProbe,
      margin,
      color,
      interactive,
    } = props;

    const {
      drawSVG,
      drawLine,
      getScales,
      drawAxis,
      updateInteractions,
      drawYearAxis,
    } = sparkLineFunctions;
    const svg = drawSVG({
      container,
      width,
      height,
      margin,
    });

    const scales = getScales({
      indicatorData,
      width,
      height,
      yearRange,
    });

    const axis = drawAxis({
      svg,
      scales,
      margin,
      indicatorData,
    });

    const yearAxis = drawYearAxis({
      svg,
      scales,
      margin,
    });

    const line = drawLine({
      indicatorData,
      svg,
      scales,
      margin,
      color,
    });

    updateInteractions({
      indicatorData,
      svg,
      scales,
      dataProbe,
      interactive,
    });

    Object.assign(props, {
      svg,
      scales,
      line,
      axis,
      yearAxis,
    });
  },
};

class SparkLine {
  constructor(config) {
    privateProps.set(this, {
      height: 30,
      width: 180,
      margin: 15,
      indicatorData: null,
      yearRange: null,
      expanded: false,
      selected: false,
      highlightedId: null,
      interactive: true,
    });

    const {
      init,
    } = privateMethods;

    this.config(config);

    init.call(this);

    this.updateSelected();
  }

  config(config) {
    Object.assign(privateProps.get(this), config);
    return this;
  }

  getIndicator() {
    const { indicatorData } = privateProps.get(this);
    return indicatorData;
  }

  updateSelected() {
    const {
      selected,
      line,
    } = privateProps.get(this);

    line.classed('sidebar__sparkline-path--selected', selected);
  }

  updateExpanded() {
    const {
      expanded,
      height,
    } = privateProps.get(this);

    if (expanded === true) {
      this.config({
        height: 160,
      }).updateSize();
    } else if (height !== 30) {
      this.config({
        height: 30,
      }).updateSize();
    }

    return this;
  }

  updateHighlighted() {
    const {
      highlightedId,
      line,
    } = privateProps.get(this);

    line.classed('sidebar__sparkline-path--highlighted', d => d.globalId === highlightedId);
  }

  updateSize() {
    const {
      getScales,
      updateSparkline,
      updateInteractions,
    } = sparkLineFunctions;

    const props = privateProps.get(this);

    const {
      indicatorData,
      yearRange,
      width,
      height,
      margin,
      svg,
      expanded,
      line,
      dataProbe,
      axis,
      interactive,
    } = props;

    const scales = getScales({
      indicatorData,
      width,
      height,
      yearRange,
    });

    Object.assign(props, {
      scales,
    });

    updateSparkline({
      expanded,
      svg,
      line,
      scales,
      width,
      height,
      margin,
      indicatorData,
      axis,
    });

    updateInteractions({
      svg,
      scales,
      dataProbe,
      interactive,
    });

    return this;
  }
}

export default SparkLine;
