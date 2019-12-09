import React from "react";
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core/styles";
import { Divider, Grid } from "@material-ui/core";

import { BlockContainer, UserCard, TweetCard } from "../../components";

import { LeaderBoard } from "./components";

const useStyles = makeStyles(theme => ({
  page: {
    margin: theme.spacing(1)
  },
  resultsHeader: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2)
  },
  leaderboard: {
    height: "250px"
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

  // The more OR's in the search, the lower the score.
  // Tested on BarackObama and needed a 0.38 score cutoff
  const userMatchClause =
    props.match.params.location === "All Locations"
      ? "match (u:User)"
      : `CALL db.index.fulltext.queryNodes("userLocation", '${locationsClause}') yield node as u, score where score > 0.35`;

  const tweetQuery = `
  ${userMatchClause}
  MATCH (u)-[r:TWEETS_ABOUT]->(o:Topic ${topicClause})
  WHERE r.topical_volume > 0
  match (u)-[:POPULAR_TWEETED]->(t:Tweet)<-[]-(o:Topic ${topicClause})
  return u as users, t as tweets
  ORDER BY t.favorite_count + t.retweet_count DESC, u.followers_count + u.friend_count
`;

  const userQuery = `
  ${userMatchClause}
  MATCH (u)-[r:TWEETS_ABOUT]->(o:Topic ${topicClause})
  WHERE r.topical_volume > 0 and r.persona <> "Unknown"
  optional match (u)-[:POPULAR_TWEETED]->(t:Tweet)<-[:GENERATED]-(o)
  WITH u,r,t
  order by t.favorite_count + t.retweet_count DESC
  return u as users, collect(distinct t) as tweets, r as role
  ORDER BY u.followers_count + u.friend_count
  `;

  const thoughtLeaderQuery = `
  ${userMatchClause}
  MATCH (u)-[r:TWEETS_ABOUT]->(o:Topic ${topicClause})
  WHERE r.topical_volume > 0 and r.persona = "thought_leader"
  return u as users
  ORDER BY u.followers_count + u.friend_count
  `;

  const contentCreatorQuery = `
  ${userMatchClause}
  MATCH (u)-[r:TWEETS_ABOUT]->(o:Topic ${topicClause})
  WHERE r.topical_volume > 0 and r.persona = "content_creator"
  return u as users
  ORDER BY u.followers_count + u.friend_count
  `;

  const amplifierQuery = `
  ${userMatchClause}
  MATCH (u)-[r:TWEETS_ABOUT]->(o:Topic ${topicClause})
  WHERE r.topical_volume > 0 and r.persona = "amplifier"
  return u as users
  ORDER BY u.followers_count + u.friend_count
  `;

  const watchdogQuery = `
  ${userMatchClause}
  MATCH (u)-[r:TWEETS_ABOUT]->(o:Topic ${topicClause})
  WHERE r.topical_volume > 0 and r.persona = "watchdog"
  return u as users
  ORDER BY u.followers_count + u.friend_count
  `;

  const leaderBoards = [
    {
      query: thoughtLeaderQuery,
      title: "Thought Leaders",
      helperText:
        "Thought leaders are users who have a high in-degree of retweets and mentions. handles. These accounts have captured the attention of their follower networks and can be very influential."
    },
    {
      query: contentCreatorQuery,
      title: "Content Creators",
      helperText:
        "Content creators are users who have a high out-degree of original tweets. These accounts consistently share ideas and opinions on the subject on a more consistent basis than other users in their networks."
    },
    {
      query: amplifierQuery,
      title: "Amplifiers",
      helperText:
        "Amplifiers are users who have a high out-degree of retweets. These accounts are focused on broadcasting the opinions and ideas of others in their networks."
    },
    {
      query: watchdogQuery,
      title: "Watchdogs",
      helperText:
        "Watchdogs are users who have a high out-degree of mentions. These accounts may be alerting others of breaking news or holding prominent Twitter users accountable."
    }
  ];

  return (
    <React.Fragment>
      <Helmet>
        <title>
          mic-check.ai - {props.match.params.topic} /{" "}
          {props.match.params.location}
        </title>
      </Helmet>
      <Grid
        container
        className={classes.page}
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        spacing={2}
      >
        {leaderBoards.map((role, i) => (
          <Grid item sm={3} className={classes.leaderboard} key={i}>
            <BlockContainer
              query={role.query}
              cardHeight={"220px"}
              passThru
              pageSize={0}
            >
              <LeaderBoard
                title={role.title}
                history={props.history}
                helperText={role.helperText}
              />
            </BlockContainer>
          </Grid>
        ))}
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
              cardHeight={"275px"}
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
