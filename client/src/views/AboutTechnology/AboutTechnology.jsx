import React from "react";

import { Typography, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Helmet } from "react-helmet";

const useStyles = makeStyles(theme => ({
  page: {
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    "flex-grow": 1,
    position: "relative"
  },
  paper: {
    width: "80%",
    height: "80%",
    padding: "10px"
  },
  body: {
    "align-items": "left"
  }
}));

const AboutTechnology = props => {
  const classes = useStyles();

  return (
    <div className={classes.page}>
      <Helmet>
        <title>mic-check.ai - Technology</title>
      </Helmet>
      <Paper className={classes.paper}>
        <Typography variant="h2" gutterBottom>
          What Makes Mic-Check.AI Different
        </Typography>
      </Paper>
    </div>
  );
};

export default AboutTechnology;
