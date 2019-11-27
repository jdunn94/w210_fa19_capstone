import React from "react";

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
    margin: theme.spacing(1)
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
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2)
  },
  hashtagResults: {
    margin: theme.spacing(0),
    minHeight: "100px"
  },
  resultsColumns: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: "10px"
  },
  userResults: {
    width: "60%"
  },
  rightColumn: {
    width: "40%",
    display: "flex",
    flexDirection: "column"
  },
  tweetResults: {}
}));

const Results = props => {
  const classes = useStyles();

  const locationsClause =
    props.match.params.location === "All"
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
    props.match.params.topic === "All"
      ? ""
      : `{name: "${props.match.params.topic}"}`;

  const userMatchClause =
    props.match.params.location === "All"
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
    <Grid container className={classes.page} spacing={2}>
      <Grid container item spacing={2}>
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
      <Grid container item spacing={2}>
        <Grid container item sm={8}>
          <BlockContainer
            query={userQuery}
            cardHeight={"275px"}
            title={"User Community"}
            multiple
            pageSize={5}
          >
            <UserCard
              history={props.history}
              location={props.match.params.location}
              topic={props.match.params.topic}
              topicSpecific
              profileLink
            />
          </BlockContainer>
        </Grid>
        <Grid container item sm={4}>
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
  );
  /*     <div className={classes.page}>
      <Typography className={classes.resultsHeader} variant="h2">
        Search results
      </Typography>
      <Divider variant="middle" />
      <div className={classes.resultsColumns}>
        <div className={classes.userResults}>
          <BlockContainer
            query={userQuery}
            cardHeight={"275px"}
            title={"User Community"}
            multiple
            pageSize={5}
          >
            <UserCard
              history={props.history}
              location={props.match.params.location}
              topic={props.match.params.topic}
              topicSpecific
              profileLink
            />
          </BlockContainer>
        </div>
        <div className={classes.rightColumn}>
          <div className={classes.hashtagResults}>
            <BlockContainer query={hashtagQuery} cardHeight={"100px"} noFlatten>
              <HashtagCard />
            </BlockContainer>
          </div>
          <div className={classes.tweetResults}>
            <BlockContainer
              query={tweetQuery}
              cardHeight={"75px"}
              title={"Popular Tweets"}
              pageSize={5}
              multiple
            >
              <TweetCard expanded={false} history={props.history} />
            </BlockContainer>
          </div>
        </div>
      </div>
    </div>
 */
};

export default Results;
