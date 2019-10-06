import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import blue from "@material-ui/core/colors/blue";
import {
  TextField,
  Select,
  MenuItem,
  Divider,
  Paper,
  Typography
} from "@material-ui/core";
import { data as mockData } from "./data";
import Fab from "@material-ui/core/Fab";
import SearchIcon from "@material-ui/icons/Search";

const useStyles = makeStyles(theme => ({
  page: {
    display: "flex",
    "align-items": "center",
    "flex-grow": 1,
    position: "relative",
    flexDirection: "column"
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
    top: "5%"
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
  },
  results: {
    display: "flex",
    flexDirection: "row",
    position: "relative",
    top: "15%",
    width: "90%",
    justifyContent: "space-evenly"
  },
  resultsBlock: {
    width: "40%"
  }
}));

const Results = props => {
  const classes = useStyles();

  const [state, updateState] = useState(mockData);

  if (
    props.match.location !== state.whereValue &&
    props.match.topic !== state.whatValue
  ) {
    updateState({
      ...state,
      whereValue: props.match.location,
      whatValue: props.match.topic
    });
  }

  const handleChange = name => event => {
    updateState({ ...state, [name]: event.target.value });
  };

  const handleExplore = event => {
    updateState({ ...state, showSearch: !state.showSearch });
  };

  const handleSearch = event => {
    event.preventDefault();
    props.history.push(`/results/${state.whereValue}/${state.whatValue}`);
  };

  return (
    <div className={classes.page}>
      <Paper className={classes.searchBox}>
        <form className={classes.searchForm}>
          <TextField
            id="what"
            label="What's going on?"
            className={classes.textField}
            value={state.whatValue}
            onChange={handleChange("whatValue")}
            margin="normal"
            defaultValue={state.whatDefault}
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
          <Fab
            color="primary"
            aria-label="search"
            className={classes.fab}
            onClick={handleSearch}
            disabled={state.whereValue === "" || state.whatValue === ""}
          >
            <SearchIcon />
          </Fab>
        </form>
      </Paper>
      <div className={classes.results}>
        <Paper className={classes.resultsBlock}>
          <Typography>Top Matches</Typography>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ut
            dolor ut erat sodales elementum. Curabitur euismod, arcu ac
            venenatis ornare, orci magna tristique ante, porta consectetur nulla
            nulla sit amet purus. Sed elementum odio vel ligula mollis faucibus.
            Praesent suscipit metus nec erat mattis faucibus. Nullam porta diam
            arcu, id pulvinar urna auctor ultrices. Etiam venenatis sem ligula,
            cursus aliquet nisi viverra quis. Nulla eget accumsan nunc. Praesent
            feugiat scelerisque elit non pulvinar.
          </Typography>
        </Paper>
        <Paper className={classes.resultsBlock}>
          <Typography>Similar Topics</Typography>
        </Paper>
      </div>
    </div>
  );
};

export default Results;
