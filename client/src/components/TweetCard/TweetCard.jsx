import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import { Typography, Link } from "@material-ui/core";
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

const TweetCard = props => {
  const classes = useStyles();

  const handleClick = event => {
    props.navigateTweet(props.data.get("t").properties.id.toString());
  };

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <Link
            href={
              "https://twitter.com/" +
              props.data.get("users").properties.screen_name +
              "/status/" +
              props.data.get("tweets").properties.id
            }
            target="_blank"
            rel="noopener"
            color="inherit"
            variant="h6"
            gutterBottom
          >
            @{props.data.get("users").properties.screen_name}:{" "}
            {new Date(
              props.data.get("tweets").properties.created_at_date.toString()
            ).toLocaleDateString() +" " + new Date(
              props.data.get("tweets").properties.created_at_date.toString()
            ).toLocaleTimeString() || "n/a creation"}
          </Link>
        </Typography>
        <Typography className={classes.quotedTweet} gutterBottom>
          {props.data.get("tweets").properties.text}
        </Typography>
        <div>
          <Typography variant="body2" component="p">
            Retweets:{" "}
            {!!props.data.get("tweets").properties.retweet_count
              ? props.data.get("tweets").properties.retweet_count.toString()
              : "n/a"}{" "}
            | Favorites:{" "}
            {!!props.data.get("tweets").properties.favorite_count
              ? props.data.get("tweets").properties.favorite_count.toString()
              : "n/a"}
          </Typography>
        </div>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleClick}>
          View Insights
        </Button>
      </CardActions>
    </Card>
  );
};

export default TweetCard;
