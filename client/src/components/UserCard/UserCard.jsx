import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { grey } from "@material-ui/core/colors";

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

const UserCard = props => {
  const classes = useStyles();

  const handleClick = event => {
    props.navigateUser(props.data.get("users").properties.screen_name, props.topic, props.location);
  };

  const headlineCondensed = `${props.data.get("users").properties.name} | ${
    props.data.get("users").properties.followers_count
  } followers | ${props.data.get("users").properties.friend_count} friends`;

  const headlineExpanded = `${props.data.get("users").properties.name} | ${
    props.data.get("users").properties.location
  } | ${props.data.get("users").properties.followers_count} followers | ${
    props.data.get("users").properties.friend_count
  } friends`;

  console.log(props.data);

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

  if (!props.expanded) {
    return (
      <Card className={classes.card}>
        <CardContent>
          <Typography>
            <Link
              href={
                "https://twitter.com/" +
                props.data.get("users").properties.screen_name
              }
              target="_blank"
              rel="noopener"
              color="inherit"
              variant="h6"
              gutterBottom
            >
              @{props.data.get("users").properties.screen_name}
            </Link>
          </Typography>
          <Typography variant="body2" component="p">
            {headlineCondensed}
          </Typography>
          <Typography variant="body2" component="p" gutterBottom>
            Community Leader
          </Typography>
          <Typography variant="body2" component="p">
            <b>Description:</b> {props.data.get("users").properties.description}
          </Typography>
          <br />
          <Typography variant="subtitle2">Popular tweets:</Typography>
          {props.data.get("tweets").map(a => tweetToLine(a))}
        </CardContent>
        <CardActions>
          <Button size="small" onClick={handleClick}>
            View Insights
          </Button>
        </CardActions>
      </Card>
    );
  }

  const userName = "@" + props.data.get("users").properties.screen_name;
  const insights = (
    <div key={props.data.get("users").properties.id.toString()}>
      <ul>
      <Typography variant="body2" component="li" gutterBottom>
        {(props.data.get("users").properties.topical_volume * 100).toFixed(2)}% of {userName}'s tweets are about {props.topic}
      </Typography>
      <Typography variant="body2" component="li" gutterBottom>
      {userName} tweets {(props.data.get("users").properties.relative_volume*100).toFixed(0)}% more than other leaders in {props.location}
      </Typography>
      <Typography variant="body2" component="li" gutterBottom>
        {userName}'s tweets about {props.topic} are {props.data.get("users").properties.topical_sentiment * 100}% more positive than other leaders in {props.location}
      </Typography>
      <Typography variant="body2" component="li" gutterBottom>
        {parseFloat(props.data.get("users").properties.topical_retweets.toString())*100}% of {userName}'s tweets are retweeted by over 1000 people
      </Typography>
      <Typography variant="body2" component="li" gutterBottom>
        {userName} uses these hashtags when talking about {props.topic}: {props.data.get("users").properties.common_hashtags}
      </Typography>
      </ul>
    </div>
  );

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography>
          <Link
            href={
              "https://twitter.com/" +
              props.data.get("users").properties.screen_name
            }
            target="_blank"
            rel="noopener"
            color="inherit"
            variant="h6"
            gutterBottom
          >
            @{props.data.get("users").properties.screen_name}
          </Link>
        </Typography>
        <Typography variant="body2" component="p">
          {headlineExpanded}
        </Typography>
        <Typography variant="body2" component="p" gutterBottom>
          Community Leader
        </Typography>
        <Typography variant="body2" component="p">
          <b>Description:</b> {props.data.get("users").properties.description}
        </Typography>
        <br />
        <Typography variant="subtitle2">Popular tweets:</Typography>
        {props.data.get("tweets").map(a => tweetToLine(a))}
        <Typography variant="subtitle2">Insights on {props.topic}:</Typography>
        {insights}
      </CardContent>
    </Card>
  );
};

export default UserCard;
