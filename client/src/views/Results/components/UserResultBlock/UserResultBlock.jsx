import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";

import { UserResultCard } from "../../components";
import { Skeleton } from "@material-ui/lab";

import { Neo4jContext } from "../../../../services";

const useStyles = makeStyles(theme => ({
  results: {
    display: "flex",
    flexDirection: "column",
  },
  resultCard: {
    margin: theme.spacing(2)
  }
}));

const UserResultBlock = props => {
  const classes = useStyles();
  const driver = useContext(Neo4jContext);

  const [users, updateUsers] = useState([]);
  const [isUsersLoading, updateUsersLoading] = useState(false);

  useEffect(() => {
    const session = driver.session();
    updateUsers(old => []);
    updateUsersLoading(true);
    session
      .run(
        `
        match (u:User)-[:TWEETED]->(t:Tweet)
        where t.text_lower contains("${props.topic}")
        with u, count(t) as relevant_tweet_count, collect(t)[..1] as relevant_tweets
        match (u)-[:TWEETED]->(t:Tweet)
        return u as user, relevant_tweets, relevant_tweet_count, round(100*relevant_tweet_count/toFloat(count(t))) as pct
        order by relevant_tweet_count*pct desc
        limit 20
      `
      )
      .subscribe({
        onKeys: keys => {
          console.log("keys");
          console.log(keys);
        },
        onNext: record => {
          updateUsers(oldUsers => [...oldUsers, record]);
        },
        onCompleted: () => {
          updateUsersLoading(false);
          session.close(); // returns a Promise
        },
        onError: error => {
          console.log(error);
        }
      });
  }, [props.topic]);

  const navigateUser = id => {
    props.history.push(`/user/${id}`);
  };

  return (
    <div className={classes.results}>
      {isUsersLoading ? (
        <Skeleton variant="rect" width="" />
      ) : (
        users.map((userResult, i) => (
          <div key={i} className={classes.resultCard}>
            <UserResultCard data={userResult} navigateUser={navigateUser} />
          </div>
        ))
      )}
    </div>
  );
};

export default UserResultBlock;
