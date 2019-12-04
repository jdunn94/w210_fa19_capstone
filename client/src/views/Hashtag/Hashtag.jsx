import React from "react";
import { Helmet } from "react-helmet";
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
      <Helmet>
        <title>Mic-Check.AI - Hashtag Info</title>
      </Helmet>
      <Typography>Hashtag info for {props.match.params.name}...</Typography>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-evenly"
        }}
      >
        <div>
          <Typography>
            Other tweets using this hashtag in {props.match.params.location}:
          </Typography>
          <div style={{ width: "40%", height: "20%", marginBottom: "100px" }}>
            Lorem Impsum - % Expected relevance for {props.match.params.topic}
          </div>
          <Typography>Other tweets using this hashtag everywhere:</Typography>
          <div style={{ width: "40%", height: "20%" }}>
            Lorem Impsum - % Expected relevance for {props.match.params.topic}
          </div>
        </div>
        <div>
          <Typography>
            Users in {props.match.params.location} that use this hashtag:
          </Typography>
          <div style={{ width: "40%", height: "20%", marginBottom: "100px" }}>
            Lorem Impsum - % Expected relevance for {props.match.params.topic}
          </div>
          <Typography>Users everywhere that use this hashtag:</Typography>
          <div style={{ width: "40%", height: "20%" }}>
            Lorem Impsum - % Expected relevance for {props.match.params.topic}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hashtag;
