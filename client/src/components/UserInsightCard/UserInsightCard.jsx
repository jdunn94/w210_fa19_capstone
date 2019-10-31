import React from "react";
import PropTypes from "prop-types";

import { makeStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import { Card, Typography, CardContent } from "@material-ui/core";

const useStyles = makeStyles({
  card: {
    minWidth: 275
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  },
  quotedTweet: {
    background: grey[300]
  },
  userInfo: {
    display: "flex",
    flexDirection: "row"
  },
  userInfoBlock: {
    display: "flex",
    flexDirection: "column",
    width: "350px"
  },
  keyValueText: {
    display: "flex"
  }
});

const UserInsightCard = props => {
  const classes = useStyles();

  const tweetToLine = tweet => {
    const created = new Date(
      tweet.properties.created_at_date.toString()
    ).toLocaleDateString();
    const text = tweet.properties.text;
    const retweets = tweet.properties.retweet_count.toString();
    const favorites = tweet.properties.favorite_count.toString();

    return (
      <div className={classes.quotedTweet} key={tweet.properties.id}>
        <Typography gutterBottom>
          <b>
            {created} | RT: {retweets} | F: {favorites}{" "}
          </b>{" "}
          {text}
        </Typography>
      </div>
    );
  };

  const userProps = props.data.get("users").properties;
  const insights = (
    <div key={userProps.id.toString()}>
      <ul>
        <Typography variant="body2" component="li" gutterBottom>
          {(userProps.topical_volume * 100).toFixed(2)}% of tweets are on topic
        </Typography>
        <Typography variant="body2" component="li" gutterBottom>
          {(userProps.relative_volume * 100).toFixed(0)}% more on topic tweets
          than other leaders
        </Typography>
        <Typography variant="body2" component="li" gutterBottom>
          {userProps.topical_sentiment * 100}% more positive than other leaders
        </Typography>
        <Typography variant="body2" component="li" gutterBottom>
          {parseFloat(userProps.topical_retweets.toString()) * 100}% of tweets
          are retweeted by over 1000 people
        </Typography>
        <Typography variant="body2" component="li" gutterBottom>
          Common hashtags:
          {!!userProps.common_hashtags ? userProps.common_hashtags : " none"}
        </Typography>
      </ul>
    </div>
  );

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {`{${props.topic}} for @${userProps.screen_name}`}
        </Typography>
        <Typography variant="body2" component="p" gutterBottom>
          Role: Community Leader
        </Typography>
        <br />
        <Typography variant="subtitle2">Insights:</Typography>
        {insights}
        <br />
        <Typography variant="subtitle2">Popular tweets:</Typography>
        {props.data.get("tweets").map(a => tweetToLine(a))}
      </CardContent>
    </Card>
  );
};

UserInsightCard.propTypes = {
  data: PropTypes.object,
  topic: PropTypes.string,
  location: PropTypes.string
};

export default UserInsightCard;
