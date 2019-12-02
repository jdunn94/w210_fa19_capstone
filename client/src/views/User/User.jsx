import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid } from "@material-ui/core";

import {
  BlockContainer,
  UserCard,
  ScrollToTopOnMount,
  UserInsightCard
} from "../../components";

const useStyles = makeStyles(theme => ({
  page: {
    margin: theme.spacing(1)
  },
  resultsHeader: {
    textAlign: "left"
  },
  hashtagResults: {
    margin: theme.spacing(2),
    minHeight: "100px"
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
    <Grid container item className={classes.page} alignItems="center" justify="center" direction="row">
      <ScrollToTopOnMount />
      <Grid item xs={12}>
        <Typography className={classes.resultsHeader} variant="h2">
          User Info
        </Typography>
      </Grid>
      <Grid container item sm={8} alignItems="flex-start" justify="flex-start" direction="row" spacing={1}>
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
      </Grid>
    </Grid>
  );
};

export default User;
