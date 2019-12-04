import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Typography, Grid } from "@material-ui/core";
import { Helmet } from "react-helmet";

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

  const userQuery = `
  match (u:User {screen_name: "${props.match.params.name}"})
  with u
  return u as users
`;

  // breaks on blank location
  const userInsightQuery = `
  MATCH (u:User {screen_name: "${props.match.params.name}"})-[r:TWEETS_ABOUT]->(o:Topic)
  WHERE r.topical_volume > 0 and r.persona <> "Unknown"
  match (u)-[:POPULAR_TWEETED]->(t:Tweet)<-[:GENERATED]-(o)
  match (u)-[:COMMON_HASHTAG]->(h:Hashtag)<-[:GENERATED]-(o)
  CALL db.index.fulltext.queryNodes("userLocation", CASE u.location WHEN "" THEN "n9uag3094ghoefkdz" else "'" + u.location +"'" end)
  yield node as u_others, score
  OPTIONAL match (u_others)-[r2:TWEETS_ABOUT {persona: r.persona}]->(o)
  where u_others <> u
  OPTIONAL match (u_others)-[:COMMON_HASHTAG]->(h2:Hashtag)<-[:GENERATED]-(o)
  WITH u,r,t,o,r2,h,h2
  order by t.favorite_count + t.retweet_count DESC, h2.topical_count desc, h.topical_count desc
  return u as users, collect(distinct t)[..3] as tweets, collect(distinct h) as hashtags, r as role, o as topic,
    {topical_volume: avg(r2.topical_volume), topical_retweets: avg(r2.topical_retweets), hashtags: collect(distinct h2)} as r2_stats
    ORDER BY u.followers_count + u.friend_count
  `;

  console.log(userInsightQuery);

  return (
    <React.Fragment>
      <Helmet>
        <title>mic-check.ai - {props.match.params.name}</title>
      </Helmet>
      <Grid
        container
        item
        className={classes.page}
        alignItems="center"
        justify="center"
        direction="row"
      >
        <ScrollToTopOnMount />
        <Grid
          container
          item
          sm={8}
          alignItems="flex-start"
          justify="flex-start"
          direction="row"
          spacing={1}
        >
          <BlockContainer query={userQuery} cardHeight={"50px"}>
            <UserCard
              history={props.history}
              topic={props.match.params.topic}
              location={props.match.params.location}
              withLocation
            />
          </BlockContainer>
          <BlockContainer query={userInsightQuery} cardHeight={"275px"}>
            <UserInsightCard history={props.history} />
          </BlockContainer>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default User;
