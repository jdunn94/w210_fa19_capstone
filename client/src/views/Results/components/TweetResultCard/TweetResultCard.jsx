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

const TweetResultCard = props => {
  const classes = useStyles();

  const handleClick = event => {
    props.navigateTweet(props.data.get("t").properties.id.toString());
  };

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {props.data.get("user").properties.screen_name}: {props.data.get("t").properties.created_at || "n/a creation"}
        </Typography>
        <Typography className={classes.quotedTweet} gutterBottom>
          {props.data.get("t").properties.text}
        </Typography>
        <div>
          <Typography variant="body2" component="p">
            Favorite Count:{" "}
            {!!props.data.get("t").properties.favorite_count
              ? props.data.get("t").properties.favorite_count.toString()
              : "n/a"}
          </Typography>
          <Typography variant="body2" component="p">
            Retweet Count:{" "}
            {!!props.data.get("t").properties.retweet_count
              ? props.data.get("t").properties.retweet_count.toString()
              : "n/a"}
          </Typography>
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

export default TweetResultCard;
