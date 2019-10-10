import React from "react";
import { makeStyles } from "@material-ui/core/styles";
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
    flexDirection: "row",
  },
  userInfoBlock: {
    display: "flex",
    flexDirection: "column",
    width: "350px"
  },
  keyValueText: {
    display: "flex",
  }
});

const UserResultCard = props => {
  const classes = useStyles();

  const handleClick = event => {
    props.navigateUser(props.data.get("user").properties.id);
  };

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {props.data.get("user").properties.screen_name}
        </Typography>
        <div className={classes.keyValueText}>
          <Typography variant="subtitle2" gutterBottom>
            Name: 
          </Typography>
          <div style={{width: "3px"}} />
          <Typography variant="body2" component="p">
            {props.data.get("user").properties.name}
          </Typography>
        </div>
        <Typography variant="subtitle2">Description:</Typography>
        <Typography variant="body2" component="p">
          {props.data.get("user").properties.description}
        </Typography>
        <br />
        <div className={classes.userInfo}>
          <div className={classes.userInfoBlock}>
            <Typography variant="body2" component="p">
              Relevant tweets:{" "}
              {props.data.get("relevant_tweet_count").toString()}
            </Typography>
            <Typography variant="body2" component="p">
              Percent of total tweets as relevant:{" "}
              {props.data.get("pct").toString()}%
            </Typography>
            <Typography variant="body2" component="p">
              Profile location:{" "}
              {props.data.get("user").properties.location || "n/a"}
            </Typography>
          </div>
          <div className={classes.userInfoBlock}>
            <Typography variant="body2" component="p">
              Followers count:{" "}
              {props.data.get("user").properties.followers_count.toString()}
            </Typography>
            <Typography variant="body2" component="p">
              Friend count:{" "}
              {props.data.get("user").properties.friend_count.toString()}
            </Typography>
            <Typography variant="body2" component="p">
              Account created on: {props.data.get("user").properties.created}
            </Typography>
          </div>
        </div>
        <br />
        <Typography variant="subtitle2">
          Most recent relevant tweet: (
          {props.data.get("relevant_tweets")[0].properties.created_at ||
            "n/a creation date"}
          )
        </Typography>
        <div className={classes.quotedTweet}>
          {props.data.get("relevant_tweets")[0].properties.text}
        </div>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleClick}>
          More info
        </Button>
      </CardActions>
    </Card>
  );
};

export default UserResultCard;
