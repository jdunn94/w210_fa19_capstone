import React, { useState } from "react";
import "./search.css";

import { makeStyles } from "@material-ui/core/styles";
import blue from "@material-ui/core/colors/blue";
import { TextField, Select, MenuItem, Divider, Paper } from "@material-ui/core";
import { data as mockData } from "./data";
import Fab from "@material-ui/core/Fab";
import SearchIcon from "@material-ui/icons/Search";
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
    padding: theme.spacing(3, 2),
    width: "70vw",
    height: "12vh",
    "background-color": blue[500],
    zIndex: 100,
    display: "flex",
    position: "relative",
    "align-items": "center",
    "justify-content": "center"
  },
  searchForm: {
    display: "flex",
    width: "100%",
    "justify-content": "center"
  },
  textField: {
    "background-color": "white",
    width: "40%",
    margin: theme.spacing(1)
  },
  input: {
    "background-color": "white"
  },
  fab: {
    margin: theme.spacing(1)
  },
  explore: {
    zIndex: 1000,
    bottom: "-20%",
    position: "absolute",
    width: "400px"
  }
}));

const Search = props => {
  const classes = useStyles();

  const [state, updateState] = useState(mockData);

  const handleChange = name => event => {
    updateState({ ...state, [name]: event.target.value });
  };

  const handleExplore = event => {
      updateState({...state, showSearch: !state.showSearch})
  }

  let searchBox = null;
  if (state.showSearch) {
    searchBox = (
      <Paper className={classes.searchBox}>
        <form className={classes.searchForm}>
          <TextField
            id="what"
            label="What's going on?"
            className={classes.textField}
            value={state.nameValue}
            onChange={handleChange("whatValue")}
            margin="normal"
            defaultValue={state.nameDefault}
            variant="filled"
            inputProps={{
              className: classes.input
            }}
          />
          <Divider orientation="vertical" />
          <Select
            className={classes.textField}
            value={state.whereValue}
            onChange={handleChange("whereValue")}
            name="Where?"
            inputProps={{
              name: "where",
              id: "where"
            }}
          >
            {state.whereOptions.map((a, i) => (
              <MenuItem id={i} value={a}>
                {a}
              </MenuItem>
            ))}
          </Select>
          <Fab color="primary" aria-label="search" className={classes.fab}>
            <SearchIcon />
          </Fab>
        </form>
        <Fab
          variant="extended"
          aria-label="explore"
          className={classes.explore}
          onClick={handleExplore}
        >
          Just Explore
        </Fab>
      </Paper>
    );
  }

  return (
    <div className={classes.searchPage}>
      {searchBox}
      <div className={classes.mapBackground}>
        <MapViewer hover={!state.showSearch}/>
      </div>
    </div>
  );
};

export default Search;
