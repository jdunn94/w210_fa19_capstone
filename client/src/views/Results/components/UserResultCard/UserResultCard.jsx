import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { v1 as neo4j } from "neo4j-driver";

const useStyles = makeStyles({
  card: {
    minWidth: 275
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  }
});

const Results = props => {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;

  console.log(props.data);
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography
          className={classes.title}
          color="textSecondary"
          gutterBottom
        >
          {props.data.get("user").properties.screen_name}
        </Typography>
        <Typography variant="body2" component="p">
          Account created on: {props.data.get("user").properties.created}
        </Typography>
        <Typography variant="body2" component="p">
          Relevant tweets: {props.data.get("relevant_tweet_count").toString()}
        </Typography>
        <Typography variant="body2" component="p">
          Percent of total tweets as relevant: {props.data.get("pct").toString()}%
        </Typography>
        <Typography variant="h7" component="h3">
          Most recent relevant tweet: ({props.data.get("relevant_tweets")[0].properties.created_at || "n/a time"}) {props.data.get("relevant_tweets")[0].properties.text}
        </Typography>{" "}
      </CardContent>
      <CardActions>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
};

export default Results;
