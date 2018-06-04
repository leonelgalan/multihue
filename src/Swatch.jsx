import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Swatch extends Component {
  static defaultProps = {
    colors: [],
    onColorClick: () => {},
  }

  static propTypes = {
    colors: PropTypes.arrayOf(PropTypes.string),
    onColorClick: PropTypes.func,
  }

  render() {
    const { colors } = this.props;

    return (
      <table>
        <tbody>
          { colors.map(color => <tr key={color} ><td onClick={e => this.props.onColorClick(e.target.getAttribute('title'))} style={{ backgroundColor: color }} title={color} /></tr> ) }
        </tbody>
      </table>
    );
  }
}
