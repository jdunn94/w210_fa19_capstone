import React from "react";
import {
  Link,
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  makeStyles
} from "@material-ui/core";
import PropTypes from "prop-types";
import logo from "./logo.png";
import happyface from "./happyface.png";
import heart from "./heart.png";
import person from "./people.png";
import retweet from "./retweet.png";
import { decodeEntities, toTitleCase } from "../../utilities";


const useStyles = makeStyles({
  card: {
    width: "100%"
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
    //maxWidth: "300px !important",
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
      tweet.properties.created_at_date.toString()).toLocaleDateString() + " " +
		  new Date(
			  tweet.properties.created_at_date.toString()).toLocaleTimeString();
    const text = tweet.properties.text;
    const retweets = tweet.properties.retweet_count.toString();
    const favorites = tweet.properties.favorite_count.toString();

    return (
      <div key={tweet.properties.id}>
        <Typography gutterBottom className={classes.quotedTweet}>
          {decodeEntities(text)}
        </Typography>
	<Typography gutterBottom className={classes.entrySubtitle}>
	    <img src={heart} alt="Heart" style={{ marginRight: "4px" }} />
	    Favorites: {favorites} | 
	    <img src={retweet} alt="Retweet" style={{ marginRight: "4px" }} />
	    Retweets: {retweets} | {created} 
    	</Typography>
     </div>
    );
  };

  // headline
  let headline = `${props.data.get("users").properties.followers_count} Followers`;

  if (props.withLocation) {
    headline = `${props.data.get("users").properties.name} | ${
      props.data.get("users").properties.location
    } | Followers: ${
      props.data.get("users").properties.followers_count
    }`;
  }

  // role
  const role = props.topicSpecific ? (
    <Typography
      variant="body2"
      component="p"
      gutterBottom
      className={classes.entrySubtitle}
    >
      <b>Role:</b> {toTitleCase(props.data.get("role").properties.persona)}
    </Typography>
  ): null;

  // tweets
  const userTweets = !props.topicSpecific ? null : (
    <div>
      <br />
      <Typography variant="subtitle2" className={classes.entrySubtitle}>
        <b>Popular tweets:</b>
      </Typography>
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
              <td rowSpan="2" className={classes.th} width="5%">
                <img src={person} alt="Person" className={classes.icon} />
              </td>
              <td className={classes.entryTitle} className={classes.th} width="35%">
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
              <td width="60%" rowSpan="2" className={classes.th}>
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
        ></Typography>
        {props.topicSpecific && userTweets}
        {props.topicSpecific && role}
        <Typography
          variant="body2"
          component="p"
          className={classes.entrySubtitle}
        >
          <b>Description:</b> {decodeEntities(props.data.get("users").properties.description)}
        </Typography>
          <Typography
            variant="body2"
            component="p"
            className={classes.entrySubtitle}
          >
	  <img src={happyface} alt="HappyFace" style={{ marginRight: "4px" }} /> 
	  {headline}
          </Typography>
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
