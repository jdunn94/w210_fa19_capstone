import React from "react";
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Divider, Grid } from "@material-ui/core";

import {
  BlockContainer,
  UserCard,
  HashtagCard,
  TweetCard
} from "../../components";

const useStyles = makeStyles(theme => ({
  page: {
    margin: theme.spacing(1),
  },
  resultsHeader: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2)
  }
}));

const Results = props => {
  const classes = useStyles();

  const locationsClause =
    props.match.params.location === "All Locations"
      ? "*"
      : props.match.params.location
          .split(", ")[0]
          .split("-")
          .map(
            a =>
              `"${a
                .split(" ")
                .map(b => b + "~")
                .join(" ")}"`
          )
          .join(" OR ");

  const topicClause =
    props.match.params.topic === "All Topics"
      ? ""
      : `{name: "${props.match.params.topic}"}`;

  const userMatchClause =
    props.match.params.location === "All Locations"
      ? "match (u:User)"
      : `CALL db.index.fulltext.queryNodes("userLocation", '${locationsClause}') yield node as u, score where score > 1`;

  const tweetQuery = `
  ${userMatchClause}
  match (u)-[:POPULAR_TWEETED]->(t:Tweet)<-[]-(o:Topic ${topicClause})
  return u as users, t as tweets
  ORDER BY t.favorite_count + t.retweet_count DESC, u.followers_count + u.friend_count
`;

  const userQuery = `
  ${userMatchClause}
  match (u)-[:POPULAR_TWEETED]->(t:Tweet)<-[]-(o:Topic ${topicClause})
  WITH u,t
  order by t.favorite_count + t.retweet_count DESC
  return u as users, collect(t) as tweets
  ORDER BY u.followers_count + u.friend_count
  `;

  console.log(userQuery);

  const hashtagQuery = `
  MATCH (:Topic ${topicClause})-[:GENERATED]->(t:Tweet)<-[:POPULAR_TWEETED]-(u:User)-[:COMMON_HASHTAG]->(h:Hashtag)
  RETURN h, h.name, h.topical_count ORDER BY h.topical_count DESC
  `;

  return (
    <React.Fragment>
      <Helmet>
        <title>MC.AI - Results</title>
      </Helmet>
      <Grid
        container
        className={classes.page}
        direction="row"
        xs={12}
        justify="flex-start"
        alignItems="flex-start"
        spacing={2}
      >
        <Grid container item spacing={2} direction="row" justify="flex-start" alignItems="flex-start">
          <Grid item sm={8}>
            <Typography className={classes.resultsHeader} variant="h2">
              Search results
            </Typography>
          </Grid>
          <Grid container item sm={4} zeroMinWidth>
            <BlockContainer query={hashtagQuery} cardHeight={"100px"} noFlatten>
              <HashtagCard />
            </BlockContainer>
          </Grid>
        </Grid>
        <Grid item sm={12}>
          <Divider variant="middle" />
        </Grid>
        <Grid container item spacing={1}>
          <Grid container item sm={8} alignItems="flex-start">
            <BlockContainer
              query={userQuery}
              cardHeight={"275px"}
              title={"User Community"}
              multiple
              pageSize={5}
            >
              <UserCard history={props.history} topicSpecific profileLink />
            </BlockContainer>
          </Grid>
          <Grid container item sm={4} alignItems="flex-start">
            <BlockContainer
              query={tweetQuery}
              cardHeight={"75px"}
              title={"Popular Tweets"}
              pageSize={5}
              multiple
            >
              <TweetCard expanded={false} history={props.history} />
            </BlockContainer>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default Results;
