import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";

import { SearchBox } from "../../components";
import {
  UserResultBlock,
  HashtagResultBlock,
  TweetResultBlock
} from "./components";

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
  },
}));

const Results = props => {
  const classes = useStyles();

  const handleExplore = event => {
    props.history.push(`/explore`);
  };

  const handleSearch = (what, where) => {
    props.history.push(`/results/${where}/${what}`);
  };

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
        <div className={classes.hashtagResults}>
          <HashtagResultBlock topic={props.match.params.topic} history={props.history} />
        </div>
        <div className={classes.resultsColumns}>
          <div className={classes.userResults}>
            <UserResultBlock topic={props.match.params.topic} history={props.history} />
          </div>
          <div className={classes.tweetResults}>
            <TweetResultBlock topic={props.match.params.topic} history={props.history}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
