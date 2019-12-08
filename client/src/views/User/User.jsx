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
  optional match (u)-[:POPULAR_TWEETED]->(t:Tweet)<-[:GENERATED]-(o)
  optional match (u)-[:COMMON_HASHTAG]->(h:Hashtag)<-[:GENERATED]-(o)
  with u,r,o,h,t
  order by t.favorite_count + t.retweet_count DESC, h.topical_count desc
  with u,r,o,collect(distinct h) as hashtags, collect(distinct t) as tweets
  
  // find local users
  CALL db.index.fulltext.queryNodes("userLocation", CASE u.location WHEN "" THEN "n9uag3094ghoefkdz" else '"""' + u.location +'"""' end)
  yield node as u_local, score
  OPTIONAL match (u_local)-[r2:TWEETS_ABOUT {persona: r.persona}]->(o)
  OPTIONAL match (u_local)-[:COMMON_HASHTAG]->(h2:Hashtag)<-[:GENERATED]-(o)
  with u,r,o,hashtags,tweets,r2,h2
  order by h2.topical_count desc
  with u,r,o,hashtags,tweets,{topical_volume: collect(r2.topical_volume) , topical_retweets: collect(r2.topical_retweets), hashtags: collect(distinct h2)} as local_stats
  
  // find all users
  OPTIONAL match (u_all:User)-[r3:TWEETS_ABOUT {persona: r.persona}]->(o)
  OPTIONAL match (u_all)-[:COMMON_HASHTAG]->(h3:Hashtag)<-[:GENERATED]-(o)
  WITH u,r,o,hashtags,tweets,local_stats,r3,h3
  order by h3.topical_count desc
  with u,r,o,hashtags,tweets,local_stats,{topical_volume: collect(r3.topical_volume), topical_retweets: collect(r3.topical_retweets), hashtags: collect(distinct h3)} as all_stats
  return u as users, r as role, o as topic, hashtags, tweets, local_stats, all_stats
  ORDER BY o.name asc
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
          <BlockContainer
            query={userQuery}
            cardHeight={"50px"}
          >
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
