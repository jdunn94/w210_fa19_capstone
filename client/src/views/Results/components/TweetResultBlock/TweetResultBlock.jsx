import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";

import { TweetResultCard } from "../../components";
import { Skeleton } from "@material-ui/lab";

import { Neo4jContext } from "../../../../services";

const useStyles = makeStyles(theme => ({
  results: {
    display: "flex",
    flexDirection: "column"
  },
  resultCard: {
    margin: theme.spacing(2)
  }
}));

const TweetResultBlock = props => {
  const classes = useStyles();
  const driver = useContext(Neo4jContext);

  const [tweets, updateTweets] = useState([]);
  const [isTweetsLoading, updateTweetsLoading] = useState(false);

  useEffect(() => {
    const session = driver.session();
    updateTweets(old => []);
    updateTweetsLoading(true);
    session
      .run(
        `
        match (u:User)-[:TWEETED]->(t:Tweet)
        where t.text_lower contains("${props.topic}")
        with u, count(t) as rt_count
        match (u)-[:TWEETED]->(t:Tweet)
        with u as user, rt_count, round(100*rt_count/toFloat(count(t))) as rt_pct
        order by rt_count*rt_pct desc
        limit 10
        match (user)-[:TWEETED]->(t:Tweet)
        where t.text_lower contains("${props.topic}")
        return t, user
        order by t.retweet_count+t.favorite_count desc
      `
      )
      .subscribe({
        onKeys: keys => {
          console.log(keys);
        },
        onNext: record => {
          updateTweets(old => [...old, record]);
        },
        onCompleted: () => {
          updateTweetsLoading(false);
          session.close(); // returns a Promise
        },
        onError: error => {
          console.log(error);
        }
      });
  }, [props.topic]);

  const navigateTweet = id => {
    props.history.push(`/tweet/${id}`);
  };

  return (
    <div className={classes.results}>
      {isTweetsLoading ? (
        <Skeleton />
      ) : (
        tweets.map((userResult, i) => (
          <div key={i} className={classes.resultCard}>
            <TweetResultCard data={userResult} navigateTweet={navigateTweet} />
          </div>
        ))
      )}
    </div>
  );
};

export default TweetResultBlock;
