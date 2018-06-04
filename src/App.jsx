import { range } from 'd3-array';
import { hsl } from 'd3-color';
import { scaleLinear } from 'd3-scale';
import copy from 'clipboard-copy';

import React, { Component, Fragment } from 'react';
import ReactResizeDetector from 'react-resize-detector';

import Layout from 'react-toolbox/lib/layout/Layout';
import AppBar from 'react-toolbox/lib/app_bar/AppBar';
import NavDrawer from 'react-toolbox/lib/layout/NavDrawer';
import Slider from 'react-toolbox/lib/slider';
import Switch from 'react-toolbox/lib/switch/Switch';
import Panel from 'react-toolbox/lib/layout/Panel';
import Snackbar from 'react-toolbox/lib/snackbar/Snackbar';
import ThemeProvider from 'react-toolbox/lib/ThemeProvider';

import ColorWheelWithScales from './ColorWheelWithScales';
import Swatch from './Swatch';

import theme from './assets/react-toolbox/theme';
import './assets/react-toolbox/theme.css';

const SETTINGS = {
  slices: { label: '# of Colors (Hues)', min: 20, max: 160, step: 20 },
  steps: { label: '# of Shades (Lightness)', min: 5, max: 50, step: 5 },
  number: { label: '# of Scales', min: 0, max: 8, step: 1 },
  startingHue: { label: 'Starting Hue', min: 0, max: 360, step: 10 },
  numberOfColors: { label: '# of Colors', min: 1, max: 40, step: 1 },
  hueRange: { label: 'Hue Range', min: 0, max: 180, step: 10 },
  b: { label: 'Curve', min: 2, max: 20, step: 1 },
};

export default class App extends Component {
  constructor(props) {
    super(props);

    this.containerRef = React.createRef();
    this.svgRef = React.createRef();
    this.handleChange = this.handleChange.bind(this);
    this.toggleDrawerActive = this.toggleDrawerActive.bind(this);
    this.onContainerResize = this.onContainerResize.bind(this);
    this.handleSnackbarClick = this.handleSnackbarClick.bind(this);
    this.handleSnackbarTimeout = this.handleSnackbarTimeout.bind(this);
    this.onColorClick = this.onColorClick.bind(this);

    this.state = {
      snackbarActive: false,
      snackbarMessage: undefined,
      radius: 300,
      drawerActive: false,
      drawerPinned: false,
      slices: 100,
      steps: 30,
      number: 4,
      startingHue: 45,
      numberOfColors: 15,
      hueRange: 120,
      b: 5,
    };

    const scales = this.buildScales();

    this.state = {
      ...this.state,
      scales,
    };
  }

  onContainerResize(width) {
    const radius = width < 600 ? Math.floor(width / 2) : 300;
    this.setState({ radius }, this.drawScales);
  }

  onColorClick(color) {
    copy(color);
    this.setState({
      snackbarMessage: <span><span style={{ color }}>⬤</span> {color} copied to clipboard</span>,
      snackbarActive: true,
    });
  }

  settingsSlider(name, callback = () => {}) {
    return (
      <Fragment>
        <p>{SETTINGS[name].label}</p>
        <Slider
          snaps
          editable
          value={this.state[name]}
          onChange={value => this.setState({ [name]: value }, callback)}
          {...SETTINGS[name]} />
      </Fragment>
    );
  }

  toggleDrawerActive() {
    this.setState({ drawerActive: !this.state.drawerActive });
  }

  handleChange(field, value) {
    this.setState({ ...this.state, [field]: value });
  }

  buildScale(hueStart) {
    const {
      numberOfColors: colors,
      b,
      hueRange: hueRange2,
    } = this.state;
    const toRadians = degrees => degrees * (Math.PI / 180);
    const hueRange = [hueStart, hueStart + hueRange2];
    const saturationRange = [0.50, 0.65];
    const lightnessRange = [0.85, 0.2];

    const hueScale = scaleLinear().range(hueRange);
    const lightnessScale = scaleLinear().range(lightnessRange);
    const M = (saturationRange[1] - saturationRange[0]) / ((colors - 1) - 0);

    const data = range(colors).map((x) => {
      const h = hueScale(x / (b + x));
      const s = ((M * x) + saturationRange[0]);
      const l = lightnessScale(x / (b + x));
      return {
        y: l * Math.cos(toRadians(h)),
        x: l * Math.sin(toRadians(h)),
        h,
        s,
        l,
        color: hsl(h, s, l).hex(),
      };
    });
    return data;
  }

  buildScales() {
    const { number, startingHue } = this.state;
    const HUE_STEP = 360 / number;
    return range(number).map(hue => this.buildScale(startingHue + (hue * HUE_STEP)));
  }

  rebuildScales() {
    const scales = this.buildScales();
    this.setState({ scales });
  }

  handleSnackbarTimeout() {
    this.setState({ snackbarActive: false });
  }

  handleSnackbarClick() {
    this.setState({ snackbarActive: false });
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Layout>
          <Snackbar
            action="Dismiss"
            active={this.state.snackbarActive}
            label={this.state.snackbarMessage}
            timeout={2000}
            onClick={this.handleSnackbarClick}
            onTimeout={this.handleSnackbarTimeout}
            type="cancel" />
          <NavDrawer
            active={this.state.drawerActive}
            pinned={this.state.drawerPinned}
            permanentAt="xxl"
            onOverlayClick={this.toggleDrawerActive}>
            <div style={{ overflowY: 'auto', padding: '1em' }}>
              <section>
                <h1>Color Wheel</h1>
                {this.settingsSlider('slices')}
                {this.settingsSlider('steps')}
              </section>
              <section>
                <h1>Scales</h1>
                {this.settingsSlider('number', this.rebuildScales)}
                {this.settingsSlider('startingHue', this.rebuildScales)}
                {this.settingsSlider('numberOfColors', this.rebuildScales)}
                {this.settingsSlider('hueRange', this.rebuildScales)}
                {this.settingsSlider('b', this.rebuildScales)}
              </section>
              <section>
                <h1>Settings</h1>
                <Switch
                  checked={this.state.drawerPinned}
                  label="Pin Drawer"
                  onChange={drawerPinned => this.handleChange('drawerPinned', drawerPinned)} />
              </section>
            </div>
          </NavDrawer>
          <Panel>
            <AppBar leftIcon="menu" title="Multi-hued Color Scales" onLeftIconClick={this.toggleDrawerActive} />
            <div ref={this.containerRef} style={{ flex: 1, overflowY: 'auto', padding: '1.8em' }}>
              <ReactResizeDetector handleWidth onResize={this.onContainerResize} />
              <ColorWheelWithScales
                onColorClick={this.onColorClick}
                scales={this.state.scales}
                radius={this.state.radius}
                innerRef={this.svgRef}
                slices={this.state.slices}
                steps={this.state.steps} />
              <h1>Swatches</h1>
              <div className="row">
                { this.state.scales && this.state.scales.map(scale => (
                  <div className="col" key={scale.map(color => color.color).join()} >
                    <Swatch
                      onColorClick={this.onColorClick}
                      colors={scale.map(color => color.color)} />
                  </div>
                  ))
                }
              </div>
            </div>
          </Panel>
        </Layout>
      </ThemeProvider>
    );
  }
}
