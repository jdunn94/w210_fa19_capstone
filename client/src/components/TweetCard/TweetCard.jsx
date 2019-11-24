import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import { Typography, Link } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import logo from './logo.png';
import heart from './heart.png';

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
    //background: grey[300]
    display: "block !important",
    margin: "5px 0 !important",
    padding: "7px 0 !important",
    background: "#858585 !important",
    color: "#fff !important",
    textDecoration: "none !important",
    borderRadius: "13px !important",
    boxShadow: "-1px -1px 2px #555 !important", 
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
  },
  entryTitle: {
    fontFamily: "Arial, sans-serif !important",
    padding: "5px !important",
    maxWidth: "300px !important",
  },
  entrySubtitle: {
    fontFamily: "Arial, sans-serif !important",
    padding: "5px !important",
    fontSize: 13,
    color: "#5c5c5c !important",
  }
});

const TweetCard = props => {
  const classes = useStyles();

  const handleClick = event => {
    props.history.push(`/tweet/${props.data.get("tweets").properties.id.toString()}`);
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
	    className={classes.entryTitle}
          >
	  @{props.data.get("users").properties.screen_name}:{" "}
          </Link>
	  <img src={logo} alt="Logo" align="right"/>
	  <p className={classes.entrySubtitle}>
            {new Date(
              props.data.get("tweets").properties.created_at_date.toString()
            ).toLocaleDateString() +" " + new Date(
              props.data.get("tweets").properties.created_at_date.toString()
            ).toLocaleTimeString() || "n/a creation"}
	  </p>
	</Typography>
        <Typography className={classes.quotedTweet} gutterBottom>
          {props.data.get("tweets").properties.text}
        </Typography>
        <div>
          <Typography variant="body2" component="p">
            <img src={heart} alt="Heart" align="left"/>
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
