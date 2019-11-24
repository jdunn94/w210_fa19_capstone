import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Typography, Divider } from "@material-ui/core";

import { SearchBox } from "../../components";
import {
  BlockContainer,
  UserCard,
  HashtagCard,
  TweetCard
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
  tweetResults: {
    display:"block !important",
    //width: "300px !important",
    margin: "5px 0 !important",
    padding: "7px 0 !important",
    background: "#fff !important",
    color: "#000 !important",
    textDecoration: "none !important",
    borderRadius: "13px !important",
    //textAlign: "center !important",
    boxShadow: "-1px -1px 2px #555 !important",
  }
}));

const Results = props => {
  const classes = useStyles();

  const handleExplore = event => {
    props.history.push(`/explore`);
  };

  const handleSearch = (what, where) => {
    props.history.push(`/results/${where}/${what}`);
  };

  const tweetQuery = `
  match (u:User {leader:true})-[:POPULAR_TWEETED]->(t:Tweet)
  where t.created_at_date is not null and t.retweet_count is not null and t.favorite_count is not null
  and u.location CONTAINS 'San Francisco' AND NOT(u.location CONTAINS 'Not') AND u.topical_volume > 0 
  return u as users, t as tweets
  order by t.retweet_count + t.favorite_count desc, t.created_at_date desc
`;

  const userQuery = `
  match (u:User {leader:true})-[r:POPULAR_TWEETED]->(t:Tweet)
  where t.created_at_date is not null and t.retweet_count is not null and t.favorite_count is not null
  and u.location CONTAINS 'San Francisco' AND NOT(u.location CONTAINS 'Not') AND u.topical_volume > 0 
  with u, t
  order by t.retweet_count + t.favorite_count desc, t.created_at_date desc
  return u as users, count(t) as popular_tweets, collect(t)[..3] as tweets
  order by count(t) desc
  `;

  const hashtagQuery = `
MATCH (u:User)-[:COMMON_HASHTAG]->(h:Hashtag)
WHERE u.leader=TRUE AND u.location CONTAINS 'San Francisco' AND NOT(u.location CONTAINS 'Not') AND u.topical_volume > 0
return h
order by h.topical_count desc, h.name desc
  `;

  return (
    <div className={classes.page}>
      <div className={classes.searchBox}>
        <SearchBox
          handleExplore={handleExplore}
          handleSearch={handleSearch}
          whatValue={props.match.params.topic}
          whereValue={props.match.params.location}
        />
      </div>
      <div className={classes.resultsSection}>
        <Typography className={classes.resultsHeader} variant="h5">
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
                pageSize={10}
                multiple
              >
                <TweetCard expanded={false} history={props.history} />
              </BlockContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
