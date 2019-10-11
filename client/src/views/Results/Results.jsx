import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import { SearchBox } from "../../components";
import { UserResultCard, HashtagResultCard } from "./components";
import CircularProgress from "@material-ui/core/CircularProgress";

import { Neo4jContext } from "../../services";

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
  const driver = useContext(Neo4jContext);

  const [users, updateUsers] = useState([]);
  const [isUsersLoading, updateUsersLoading] = useState(false);

  useEffect(() => {
    const session = driver.session();
    updateUsersLoading(true);
    const results = session
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
      .subscribe({
        onKeys: keys => {
          console.log("keys");
          console.log(keys);
        },
        onNext: record => {
          updateUsers(oldUsers => [...oldUsers,record]);
        },
        onCompleted: () => {
          updateUsersLoading(false)
          session.close(); // returns a Promise
        },
        onError: error => {
          console.log(error);
        }
      });
  }, [props.match.params.topic]);

  const [hashtags, updateHashtags] = useState([]);
  const [isHashtagsLoading, updateHashtagsLoading] = useState(false);

  useEffect(() => {
    const session = driver.session();
    updateHashtagsLoading(true);
    const results = session
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
      .subscribe({
        onKeys: keys => {
          console.log("keys")
          console.log(keys);
        },
        onNext: record => {
          updateHashtags(oldHashtags => [...oldHashtags, record])
        },
        onCompleted: () => {
          updateHashtagsLoading(false);
          session.close(); // returns a Promise
        },
        onError: error => {
          console.log(error);
        }
      });
  }, [props.match.params.topic]);

  const [tweets, updateTweets] = useState([]);
  const [isTweetsLoading, updateTweetsLoading] = useState(false);

  useEffect(() => {
    const session = driver.session();
    updateTweetsLoading(true);
    const results = session
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
      .subscribe({
        onKeys: keys => {
          console.log(keys);
        },
        onNext: record => {
          //console.log(record.get("name"));
        },
        onCompleted: () => {
          updateTweetsLoading(false);
          session.close(); // returns a Promise
        },
        onError: error => {
          console.log(error);
        }
      });
  }, [props.match.params.topic]);

  const handleExplore = event => {
    props.history.push(`/explore`);
  };

  const handleSearch = (what, where) => {
    props.history.push(`/results/${where}/${what}`);
  };

  const navigateUser = id => {
    props.history.push(`/user/${id}`);
  };

  const navigateHashtag = name => {
    props.history.push(`/hashtag/${name}`);
  };

  let resultBlock = null;
  if (isUsersLoading || isHashtagsLoading || isTweetsLoading) {
    resultBlock = (
      <div className={classes.results}>
        <CircularProgress className={classes.progress} />
      </div>
    );
  } else {
    resultBlock = (
      <div className={classes.results}>
        <Typography className={classes.resultsHeader} variant="h5">
          Search results
        </Typography>
        <div className={classes.resultBlocks}>
          <div className={classes.userResults}>
            {users.map((userResult, i) => (
              <div key={i} className={classes.resultCard}>
                <UserResultCard data={userResult} navigateUser={navigateUser} />
              </div>
            ))}
          </div>
          <div className={classes.hashtagResults}>
            <HashtagResultCard
              data={hashtags}
              navigateHashtag={navigateHashtag}
            />
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
