import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  page: {
    display: "flex",
    "align-items": "center",
    "flex-grow": 1,
    position: "relative",
    flexDirection: "column"
  }
}));

const Hashtag = props => {
  const classes = useStyles();

  return (
    <div className={classes.page}>
      <Typography>Hashtag info for {props.match.params.name}...</Typography>
      <Typography>Recent tweets...</Typography>
    </div>
  );
};

export default Hashtag;
