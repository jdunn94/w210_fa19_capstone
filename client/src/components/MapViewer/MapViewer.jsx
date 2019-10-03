import React, { Component } from "react";
import PropTypes from "prop-types";

import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography
} from "react-simple-maps";

import mapData from "./cb_2018_us_state_20m.json";

const wrapperStyles = {
  width: "100%",
  maxWidth: 980,
  margin: "0 auto"
};

class MapViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      previousHover: props.hover,
      optimizationDisabled: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.hover !== state.previousHover) {
      return {
        previousHover: props.hover,
        optimizationDisabled: true
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log(prevState);
    if (this.state.optimizationDisabled) {
      console.log(prevState);
      this.setState({ ...this.state, optimizationDisabled: false });
    }
  }

  render() {
    let geographyStyle = {
      default: {
        fill: "#ECEFF1",
        stroke: "#607D8B",
        strokeWidth: 0.75,
        outline: "none"
      },
      hover: {
        fill: "#ECEFF1",
        stroke: "#607D8B",
        strokeWidth: 0.75,
        outline: "none"
      },
      pressed: {
        fill: "#ECEFF1",
        stroke: "#607D8B",
        strokeWidth: 0.75,
        outline: "none"
      }
    };
    if (this.props.hover) {
      geographyStyle = {
        ...geographyStyle,
        hover: {
          fill: "#607D8B",
          stroke: "#607D8B",
          strokeWidth: 0.75,
          outline: "none"
        },
        pressed: {
          fill: "#FF5722",
          stroke: "#607D8B",
          strokeWidth: 0.75,
          outline: "none"
        }
      };
    }

    return (
      <div style={wrapperStyles}>
        <ComposableMap
          projectionConfig={{
            scale: 1000,
            rotation: [0, 0, 0]
          }}
          style={{
            width: "100%",
            height: "auto"
          }}
        >
          <ZoomableGroup center={[-95, 38]} disablePanning={!this.props.pan}>
            <Geographies geography={mapData} disableOptimization={true}>
              {(geographies, projection) =>
                geographies.map(
                  (geography, i) =>
                    geography.id !== "ATA" && (
                      <Geography
                        key={i}
                        geography={geography}
                        projection={projection}
                        style={geographyStyle}
                      />
                    )
                )
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    );
  }
}

MapViewer.propTypes = {
  hover: PropTypes.bool,
  pan: PropTypes.bool
};

MapViewer.defaultProps = {
  hover: false,
  pan: false
};

export default MapViewer;
