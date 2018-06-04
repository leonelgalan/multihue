import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { range } from 'd3-array';
import { hsl } from 'd3-color';
import { select } from 'd3-selection';
import { arc as d3Arc } from 'd3-shape';

export default class ColorWheel extends Component {
  static propTypes = {
    radius: PropTypes.number,
    slices: PropTypes.number,
    steps: PropTypes.number,
    innerRef: PropTypes.shape({
      current: PropTypes.object,
    }).isRequired,
    onColorClick: PropTypes.func,
  }

  static defaultProps = {
    radius: 300,
    slices: 90,
    steps: 25,
    onColorClick: () => {},
  }

  componentDidMount() {
    this.createColorWheel();
  }

  componentDidUpdate() {
    this.createColorWheel();
  }

  createColorWheel() {
    const {
      radius,
      slices,
      steps,
      innerRef,
    } = this.props;

    const svg = select(innerRef.current);
    svg.select('.wheel').remove();

    const wheel = svg.append('g')
      .attr('class', 'wheel')
      .attr('transform', `translate(${radius}, ${radius})`);

    range(0, 1, 1 / steps).forEach((lightness, i) => {
      const data = range(slices).map((slice) => {
        const step = 360 / slices;
        const hue = slice * step;
        return {
          startAngle: hue * (Math.PI / 180),
          endAngle: (hue + step) * (Math.PI / 180),
          fill: hsl(hue, 1, lightness).hex(),
        };
      });

      const arc = d3Arc()
        .innerRadius(i * (radius / steps))
        .outerRadius((i * (radius / steps)) + (radius / steps))
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle);

      const that = this;
      wheel.selectAll(`.lightness-${i}`).data(data);
      wheel.selectAll(`.lightness-${i}`)
        .data(data).enter()
        .append('path')
        .attr('class', `foo lightness-${i}`)
        .attr('d', arc)
        .attr('stroke', d => d.fill)
        .attr('fill', d => d.fill)
        .on('click', function onClick() {
          const color = select(this).select('title').text();
          that.props.onColorClick(color);
        })
        .append('title')
        .text(d => d.fill);
    });
  }

  render() {
    const { radius, innerRef } = this.props;
    return (
      <svg
        ref={innerRef}
        width={radius * 2}
        height={radius * 2}
        style={{ display: 'block', margin: '0 auto' }} />
    );
  }
}
