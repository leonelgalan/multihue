import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { line as d3Line } from 'd3-shape';

import ColorWheel from './ColorWheel';

export default class ColorWheelWithScales extends Component {
  static propTypes = {
    ...ColorWheel.propTypes,
    scales: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({
      color: PropTypes.string,
    }))),
  }

  static defaultProps = {
    ...ColorWheel.defaultProps,
    scales: [],
  }

  constructor(props) {
    super(props);

    this.svgRef = React.createRef();
  }

  componentDidMount() {
    this.drawScales();
  }

  componentDidUpdate() {
    this.drawScales();
  }

  drawScales() {
    const { radius, scales } = this.props;
    const x = scaleLinear().range([0, radius * 2]).domain([-1, 1]);
    const y = scaleLinear().range([radius * 2, 0]).domain([-1, 1]);

    const line = d3Line()
      .x(d => x(d.x))
      .y(d => y(d.y));

    const svg = select(this.svgRef.current);
    svg.selectAll('.scale').remove();

    scales.forEach((scale) => {
      const g = svg.append('g')
        .attr('class', 'scale');

      g.append('path')
        .attr('fill', 'none')
        .attr('stroke', '#000')
        .datum(scale)
        .attr('d', line);

      const that = this;
      let circles = g.selectAll('.circle').data(scale);
      circles.exit().remove();
      circles = circles.enter().append('circle')
        .attr('class', 'circle')
        .attr('r', 12)
        .attr('stroke', '#000')
        .attr('fill', d => d.color)
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .on('click', function onClick() {
          const color = select(this).select('title').text();
          that.props.onColorClick(color);
        })
        .append('title')
        .text(d => d.color);
    });
  }

  render() {
    return (
      <ColorWheel {...this.props} innerRef={this.svgRef} />
    );
  }
}
