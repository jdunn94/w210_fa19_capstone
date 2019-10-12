import React, { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import { v1 as neo4j } from "neo4j-driver";

const useStyles = makeStyles(theme => ({
  page: {
    display: "flex",
    "align-items": "center",
    "flex-grow": 1,
    position: "relative",
    flexDirection: "column"
  }
}));

const Tweet = props => {
  const classes = useStyles();

  const [state, updateState] = useState([[], []]);
  const [isLoading, updateLoading] = useState(false);

  useEffect(() => {
  }, []);

  return (
    <div className={classes.page}>
      <Typography>Tweet info for {props.match.params.id}...</Typography>
      <Typography>Related users...</Typography>
    </div>
  );
};

export default Tweet;
