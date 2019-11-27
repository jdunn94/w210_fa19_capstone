import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import logo from "./logo.png";
import heart from "./heart.png";
import person from "./people.png";

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
    fontFamily: "Arial, sans-serif !important",
    fontSize: "14px !important"
  },
  pos: {
    marginBottom: 12
  },
  quotedTweet: {
    //background: grey[300]
    display: "block !important",
    margin: "5px 0 !important",
    padding: "7px 0 !important",
    //background: "#ebebeb !important",
    color: "#1f1f1f !important",
    textDecoration: "none !important",
    borderRadius: "13px !important",
    boxShadow: "-1px -1px 1px #d6d6d6 !important"
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
    maxWidth: "300px !important",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#292929"
  },
  entrySubtitle: {
    fontFamily: "Arial, sans-serif !important",
    maxWidth: "300px !important",
    color: "#7a7a7a",
    fontSize: "14px"
  },
  table: {
    border: "4px solid white",
    borderCollapse: "collapse"
  },
  th: {
    border: "0px solid white",
    padding: "0px",
    textAlign: "left"
  }
});

const UserCard = props => {
  const classes = useStyles();

  const handleClick = event => {
    props.history.push(
      `/user/${props.data.get("users").properties.screen_name}`
    );
  };

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
            {created} | RT: {retweets} | F: {favorites}
          </b>
          {text}
        </Typography>
      </div>
    );
  };

  // headline
  let headline = `${
    props.data.get("users").properties.followers_count
  } followers | ${props.data.get("users").properties.friend_count} friends`;

  if (props.withLocation) {
    headline = `${props.data.get("users").properties.name} | ${
      props.data.get("users").properties.location
    } | ${props.data.get("users").properties.followers_count} followers | ${
      props.data.get("users").properties.friend_count
    } friends`;
  }

  // role
  const role = (
    <Typography variant="body2" component="p" gutterBottom>
      Role: Community Leader
    </Typography>
  );

  // tweets
  const userTweets = !props.topicSpecific ? null : (
    <div>
      <br />
      <Typography variant="subtitle2">Popular tweets:</Typography>
      {props.data.get("tweets").map(a => tweetToLine(a))}
    </div>
  );

  // view insights
  const linkToProfile = (
    <CardActions>
      <Button size="small" onClick={handleClick}>
        View Insights
      </Button>
    </CardActions>
  );

  return (
    <Card className={classes.card}>
      <CardContent>
          <table width="100%" className={classes.table}>
            <tbody>
              <tr className={classes.th}>
                <td rowSpan="2" className={classes.th}>
                  <img src={person} alt="Person" className={classes.icon} />
                </td>
                <td className={classes.entryTitle} className={classes.th}>
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
                    activeStyle={{ color: "#00acee" }}
                  >
                    {props.data.get("users").properties.name}
                  </Link>
                </td>
                <td width="70%" rowSpan="2" className={classes.th}>
                  <img src={logo} alt="Logo" align="right" />
                </td>
              </tr>
              <tr className={classes.th}>
                <td className={classes.entrySubtitle} border="0">
                  @{props.data.get("users").properties.screen_name}
                </td>
              </tr>
            </tbody>
          </table>
        <Typography
          variant="body2"
          component="p"
          className={classes.entrySubtitle}
        >
          <img src={heart} alt="Heart" align="left" />
          {headline}
        </Typography>
        {props.topicSpecific && role}
        <Typography variant="body2" component="p">
          <b>Description:</b> {props.data.get("users").properties.description}
        </Typography>
        {props.topicSpecific && userTweets}
      </CardContent>
      {props.profileLink && linkToProfile}
    </Card>
  );
};

UserCard.propTypes = {
  topicSpecific: PropTypes.bool,
  profileLink: PropTypes.bool,
  data: PropTypes.object,
  history: PropTypes.object,
  withLocation: PropTypes.bool
};

export default UserCard;
