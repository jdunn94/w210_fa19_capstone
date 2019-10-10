import React, { useState, useEffect } from "react";

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
import { SearchBox } from "../../components";
import { UserResultCard } from "./components";
import CircularProgress from "@material-ui/core/CircularProgress";

import { v1 as neo4j } from "neo4j-driver";

const useStyles = makeStyles(theme => ({
  page: {
    display: "flex",
    "align-items": "center",
    "flex-grow": 1,
    position: "relative",
    flexDirection: "column"
  },
  searchBox: {
    zIndex: 100,
    position: "sticky",
    top: "10%",
    paddingBottom: "50px"
  },
  results: {
    display: "flex",
    flexDirection: "row",
    paddingTop: "50px",
    justifyContent: "space-evenly"
  },
  resultsBlock: {
    width: "40%"
  },
  progress: {
    margin: theme.spacing(2)
  },
  resultCard: {
    margin: theme.spacing(3)
  }
}));

const Results = props => {
  const classes = useStyles();

  const [state, updateState] = useState([]);
  const [isLoading, updateLoading] = useState(false);

  useEffect(() => {
    const driver = neo4j.driver(
      // dev
      //"bolt://34.70.225.97",

      // pro
      "bolt://35.194.58.33",

      neo4j.auth.basic("guest", "guest")
    );
    const session = driver.session();
    updateLoading(true);
    session
      .run(
        `
        match (u:User)-[:TWEETED]->(t:Tweet)
        where t.text_lower contains("${props.match.params.topic}")
        with u, count(t) as relevant_tweet_count, collect(t)[..10] as relevant_tweets
        match (u)-[:TWEETED]->(t:Tweet)
        return u as user, relevant_tweets, relevant_tweet_count, round(100*relevant_tweet_count/toFloat(count(t))) as pct
        order by relevant_tweet_count desc,pct desc
        limit 10
      `
      )
      .then(results => {
        // results.records.forEach(record => console.log(record.get("user")));
        session.close();
        driver.close();

        updateLoading(false);
        updateState(results.records);
      });
  }, [props.match.params.topic]);

  const handleExplore = event => {
    props.history.push(`/explore`);
  };

  const handleSearch = (what, where) => {
    props.history.push(`/results/${where}/${what}`);
  };

  let resultBlock = null;
  if (isLoading) {
    resultBlock = (
      <div className={classes.results}>
        <CircularProgress className={classes.progress} />
      </div>
    );
  } else {
    resultBlock = (
      <div className={classes.results}>
        <div className={classes.resultsBlock}>
          <Typography>Top Matches</Typography>
          {state.map((userResult, i) => (
            <div key={i} className={classes.resultCard}>
              <UserResultCard data={userResult}/>
            </div>
          ))}
        </div>
        <Paper className={classes.resultsBlock}>
          <Typography>Similar Topics</Typography>
        </Paper>
      </div>
    );
  }
  return (
    <div className={classes.page}>
      <div className={classes.searchBox}>
        <SearchBox
          handleExplore={handleExplore}
          handleSearch={handleSearch}
          whatValue={props.match.params.topic}
          whereValue={props.match.params.location}
        />
      </div>
      {resultBlock}
    </div>
  );
};

export default Results;
