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

const User = props => {
  const classes = useStyles();

  return (
    <div className={classes.page}>
      <Typography>User info for {props.match.params.id}...</Typography>
      <Typography>Recent tweets...</Typography>
      <Typography>Related users...</Typography>
    </div>
  );
};

export default User;
