import React from "react";
import "./search.css";
import { Helmet } from "react-helmet";
import { makeStyles, Grid } from "@material-ui/core";
import { MapViewer } from "../../components";

const useStyles = makeStyles(theme => ({
  searchPage: {
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    "flex-grow": 1,
    position: "relative"
  },
  mapBackground: {
    height: "100%",
    width: "100%",
    position: "absolute",
    zIndex: 0
  },
  searchBox: {
    zIndex: 100,
    position: "relative"
  }
}));

const Explore = props => {
  const classes = useStyles();

  const handleExplore = event => {
    props.history.push(`/explore`);
  };

  const handleSearch = (what, where) => {
    props.history.push(`/results/${where}/${what}`);
  };

  return (
    <Grid item className={classes.searchPage}>
      <Helmet>
        <title>MC.AI - Explore</title>
      </Helmet>
      <div className={classes.mapBackground}>
        <MapViewer hover={props.match.params.explore} />
      </div>
    </Grid>
  );
};

export default Explore;
