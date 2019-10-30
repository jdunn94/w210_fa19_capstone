import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";

import { TweetCard } from "../";
import { Skeleton } from "@material-ui/lab";

import { Neo4jContext } from "../../services";
import { Typography, Button, ButtonGroup } from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";

const useStyles = makeStyles(theme => ({
  results: {
    display: "flex",
    flexDirection: "column"
  },
  resultCard: {
    minHeight: "75px",
    margin: theme.spacing(2)
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 20px 0px 20px"
  },
  pageNav: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  }
}));

const TweetBlock = props => {
  const classes = useStyles();
  const driver = useContext(Neo4jContext);

  const [tweets, updateTweets] = useState([]);
  const [displayPage, updatePage] = useState(0);
  const [isTweetsLoading, updateTweetsLoading] = useState(false);

  useEffect(() => {
    const session = driver.session();
    updateTweets(old => []);
    updateTweetsLoading(true);
    session.run(props.query).subscribe({
      onKeys: keys => {
        console.log(keys);
      },
      onNext: record => {
        updateTweets(old => [...old, record]);
      },
      onCompleted: () => {
        updateTweetsLoading(false);
        session.close(); // returns a Promise
      },
      onError: error => {
        console.log(error);
      }
    });
  }, [props.query]);

  const navigateTweet = id => {
    props.history.push(`/tweet/${id}`);
  };

  if (isTweetsLoading) {
    return (
      <div className={classes.results}>
        <Skeleton variant="rect" className={classes.resultCard} />
        <Skeleton variant="rect" className={classes.resultCard} />
        <Skeleton variant="rect" className={classes.resultCard} />
      </div>
    );
  }

  const tweetSlice = tweets.slice(displayPage * 10, (1 + displayPage) * 10);

  return (
    <div className={classes.results}>
      {!props.expanded && <div className={classes.header}>
        <Typography>Popular Tweets: {tweets.length}</Typography>
        <div className={classes.pageNav}>
          <Typography>
            Page {displayPage + 1} / {Math.ceil(tweets.length / 10)}
          </Typography>
          <ButtonGroup size="small" variant="text" color="primary">
            <Button
              id="previous-page"
              className={classes.button}
              aria-label="last page"
              onClick={() => updatePage(displayPage - 1)}
              disabled={displayPage === 0}
            >
              <NavigateBeforeIcon />
            </Button>
            <Button
              id="next-page"
              className={classes.button}
              aria-label="next page"
              onClick={() => updatePage(displayPage + 1)}
              disabled={tweets.length <= (1 + displayPage) * 10}
            >
              <NavigateNextIcon />
            </Button>
          </ButtonGroup>
        </div>
      </div>}
      {tweetSlice.map((result, i) => (
        <div key={i} className={classes.resultCard}>
          <TweetCard
            data={result}
            navigateTweet={navigateTweet}
            expanded={false}
          />
        </div>
      ))}
    </div>
  );
};

export default TweetBlock;
