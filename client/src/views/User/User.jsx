import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import { UserBlock, HashtagBlock, TweetBlock } from "../../components";

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
  resultsSection: {
    width: "100%",
    height: "100%",
    paddingTop: "25px"
  },
  resultsHeader: {
    textAlign: "center"
  },
  hashtagResults: {
    margin: theme.spacing(2),
    minHeight: "100px"
  },
  resultsColumns: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  userResults: {
    width: "60%"
  },
  tweetResults: {
    width: "40%"
  }
}));

const User = props => {
  const classes = useStyles();

  const tweetQuery = `
  match (u:User {screen_name: "${props.match.params.name}"})-[:POPULAR_TWEETED]->(t:Tweet)
  where t.created_at_date is not null and t.retweet_count is not null and t.favorite_count is not null
  and u.location CONTAINS 'San Francisco' AND NOT(u.location CONTAINS 'Not') AND u.topical_volume > 0 
  with u, t
  order by u.followers_count desc, t.retweet_count + t.favorite_count desc, t.created_at_date desc
  return u as users, t as tweets
`;

  const userQuery = `
  match (u:User {screen_name: "${props.match.params.name}"})-[:POPULAR_TWEETED]->(t:Tweet)
  where t.created_at_date is not null and t.retweet_count is not null and t.favorite_count is not null
  and u.location CONTAINS 'San Francisco' AND NOT(u.location CONTAINS 'Not') AND u.topical_volume > 0 
  with u, t
  order by u.followers_count desc, t.retweet_count + t.favorite_count desc, t.created_at_date desc
  return u as users, collect(t)[..3] as tweets
`;

  const hashtagQuery = `
  MATCH (u:User {screen_name: "${props.match.params.name}"})-[:COMMON_HASHTAG]->(h:Hashtag)
WHERE u.leader=TRUE AND u.location CONTAINS 'San Francisco' AND NOT(u.location CONTAINS 'Not') AND u.topical_volume > 0
return h
order by h.topical_count desc, h.name desc
  `;

  return (
    <div className={classes.page}>
      <Typography className={classes.resultsHeader} variant="h5">
        User Info
      </Typography>
      <div className={classes.resultsColumns}>
        <div className={classes.userResults}>
          <UserBlock
            query={userQuery}
            expanded={true}
            history={props.history}
            topic={props.match.params.topic}
            location={props.match.params.location}
          />
        </div>
        <div className={classes.tweetResults}>
          <TweetBlock
            query={tweetQuery}
            expanded={true}
            history={props.history}
            topic={props.match.params.topic}
            location={props.match.params.location}
          />
        </div>
      </div>
    </div>
  );
};

export default User;
