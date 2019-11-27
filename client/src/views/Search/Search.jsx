import React from "react";
import "./search.css";

import { makeStyles } from "@material-ui/core/styles";
import { MapViewer, SearchBox } from "../../components";

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
    position: "relative",
  }
}));

const Search = props => {
  const classes = useStyles();

  const handleExplore = event => {
    props.history.push(`/explore`);
  };

  const handleSearch = (what, where) => {
    props.history.push(`/results/${where}/${what}`);
  };

  return (
    <div className={classes.searchPage}>
      {!props.match.params.explore && (
        <div className={classes.searchBox}>
          <SearchBox
            handleExplore={handleExplore}
            handleSearch={handleSearch}
          />
        </div>
      )}
      <div className={classes.mapBackground}>
        <MapViewer hover={props.match.params.explore} />
      </div>
    </div>
  );
};

export default Search;
