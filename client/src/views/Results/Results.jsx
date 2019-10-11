import React, { useState, useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import { SearchBox } from "../../components";
import { UserResultCard, HashtagResultCard } from "./components";
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
    flexDirection: "column",
    paddingTop: "50px"
  },
  userResults: {
    width: "70%"
  },
  hashtagResults: {
    width: "25%",
    margin: theme.spacing(3)
  },
  progress: {
    margin: theme.spacing(2)
  },
  resultCard: {
    margin: theme.spacing(3)
  },
  resultBlocks: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  resultsHeader: {
    textAlign: "center"
  }
}));

const Results = props => {
  const classes = useStyles();

  const [state, updateState] = useState([[], []]);
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
    const userResults = session
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
        return results.records;
      });

    const hashtagResults = session
      .run(
        `
        match (u:User)-[:TWEETED]->(t:Tweet)-[:TAGGED]->(h:Hashtag)
        where t.text_lower contains("${props.match.params.topic}")
        with distinct h.name as name, count(h.name) as counts
        where counts > 1
        return name, counts
        order by counts desc
        limit 100
      `
      )
      .then(results => {
        return results.records;
      });

    Promise.all([userResults, hashtagResults]).then(results => {
      updateState(results);
      updateLoading(false);
      session.close();
      driver.close();
    });
  }, [props.match.params.topic]);

  const handleExplore = event => {
    props.history.push(`/explore`);
  };

  const handleSearch = (what, where) => {
    props.history.push(`/results/${where}/${what}`);
  };

  const navigateUser = (id) => {
    props.history.push(`/user/${id}`)
  }

  const navigateHashtag = (name) => {
    props.history.push(`/hashtag/${name}`)
  }

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
        <Typography className={classes.resultsHeader} variant="h5">Search results</Typography>
        <div className={classes.resultBlocks}>
          <div className={classes.userResults}>
            {state[0].map((userResult, i) => (
              <div key={i} className={classes.resultCard}>
                <UserResultCard data={userResult} navigateUser={navigateUser}/>
              </div>
            ))}
          </div>
          <div className={classes.hashtagResults}>
            <HashtagResultCard data={state[1]} navigateHashtag={navigateHashtag} />
          </div>
        </div>
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
