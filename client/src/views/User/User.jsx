import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import {
  BlockContainer,
  UserCard,
  TweetCard,
  ScrollToTopOnMount,
  UserInsightCard
} from "../../components";

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
  match (u:User {screen_name: "${props.match.params.name}"})-[:POPULAR_TWEETED]->(t:Tweet)<-[]-(o:Topic)
  where t.created_at_date is not null and t.retweet_count is not null and t.favorite_count is not null
  AND u.topical_volume > 0 
  with u, t, o
  order by u.followers_count desc, t.retweet_count + t.favorite_count desc, t.created_at_date desc
  return u as users, o as topics, t as tweets
`;

  const userQuery = `
  match (u:User {screen_name: "${props.match.params.name}"})
  with u
  return u as users
`;

  const userInsightQuery = `
match (u:User {screen_name: "${props.match.params.name}"})-[:POPULAR_TWEETED]->(t:Tweet)<-[]-(o:Topic)
where t.created_at_date is not null and t.retweet_count is not null and t.favorite_count is not null
AND u.topical_volume > 0 
with u, t, o
order by u.followers_count desc, t.retweet_count + t.favorite_count desc, t.created_at_date desc
return u as users, o as topics, collect(t)[..3] as tweets
`;

  return (
    <div className={classes.page}>
      <ScrollToTopOnMount />
      <Typography className={classes.resultsHeader} variant="h5">
        User Info
      </Typography>
      <div className={classes.resultsColumns}>
        <div className={classes.userResults}>
          <BlockContainer query={userQuery} cardHeight={"50px"}>
            <UserCard
              history={props.history}
              topic={props.match.params.topic}
              location={props.match.params.location}
              withLocation
            />
          </BlockContainer>
          <BlockContainer query={userInsightQuery} cardHeight={"275px"}>
            <UserInsightCard />
          </BlockContainer>
        </div>
        <div className={classes.tweetResults}>
          <BlockContainer
            query={tweetQuery}
            cardHeight={"75px"}
            title={"Retweets"}
            multiple
          >
            <TweetCard expanded={false} history={props.history} />
          </BlockContainer>
        </div>
      </div>
    </div>
  );
};

export default User;
