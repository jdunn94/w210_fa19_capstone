import React from "react";
import PropTypes from "prop-types";

import { makeStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import { Card, Typography, CardContent, Link } from "@material-ui/core";
import { decodeEntities, toTitleCase } from "../../utilities";

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

  console.log(props.data);
  const userProps = props.data.get("users").properties;
  const roleProps = props.data.get("role").properties;
  const topicProps = props.data.get("topic").properties;
  const statProps = props.data.get("r2_stats");

  const handleNavigateTopic = () => {
    props.history.push("/results/All%20Locations/" + topicProps.name);
  };

  const tweetToLine = tweet => {
    const created = new Date(
      tweet.properties.created_at_date.toString()
    ).toLocaleDateString();
    const text = decodeEntities(tweet.properties.text);
    const retweets = tweet.properties.retweet_count.toString();
    const favorites = tweet.properties.favorite_count.toString();

    return (
      <div className={classes.quotedTweet} key={tweet.properties.id}>
        <Typography gutterBottom>
          <b>
            {created} | RT: {retweets} | F: {favorites}{" "}
          </b>
          {text}
        </Typography>
      </div>
    );
  };
  console.log(roleProps);
  console.log(statProps);
  /*
  # User Insights Page
  Two versions of copy for each user insight that will tell the user what the recommendation is based on whether the 
  statistic is high or low
  * Topical volume (LOGIC: If X% > 2 * Y%, SHOW VERSION 1 ELSE SHOW VERSION 2)
      * Description: @JimmyDunn tweets about TOPIC X% of the time. The average user in the community leader role 
      living in LOCATION tweets about TOPIC Y% of the time.
      * VERSION 1: This is a high volume of tweets. This user may particularly be interested in this specific topic more so than 
      others in this group.
      * VERSION 2: This is an average or low volume of tweets. This user may occasionally tweet about this specific topic but may
       not be focused on this one issue.
  * Topical Retweets (LOGIC: If X% > 2 * Y%, SHOW VERSION 1 ELSE SHOW VERSION 2)
      * Description: X% of @JimmyDunn tweets about TOPIC are retweeted by over 1000 users. The average user in the 
      ROLE get retweeted by over 1000 people Y% of the time. 
      * VERSION 1: This is a large amount of retweets. This user has considerable influence in their network.
      * VERSION 2: This is a relatively small amount of retweets. This user may not have as much influence in their network as 
      users in other networks.
  * Common Hashtags (LOGIC: If 2 or more HASHTAGs for this user are also in the common HASHTAGS for the entire topic, SHOW VERSION 1 ELSE SHOW VERSION 2)
      * Description: HASHTAG1, HASHTAG2, and HASHTAG3 are the most common hashtags used by @JimmyDunn
      * VERSION 1: These are very common hashtags for this TOPIC LOCATION combination. This user may be aligned with a larger 
      movement or these hashtags could be fairly generic.
      * VERSION 2: These are very uncommon hashtags for this TOPIC LOCATION combination. This may be a unique hashtag and could 
      be specific or could be nonsense.*/
  const insights = (
    <div>
      <ul>
        <Typography variant="body2" component="li" gutterBottom>
          Topical Volume: @{userProps.screen_name} tweets about{" "}
          {topicProps.name} {(roleProps.topical_volume * 100).toFixed(2)}% of
          the time. The average user in the {toTitleCase(roleProps.persona)}{" "}
          role living in {userProps.location} tweets about {topicProps.name}{" "}
          {(statProps.topical_volume * 100).toFixed(2)}% of the time.
        </Typography>
        <Typography variant="body2" component="li" gutterBottom>
          {(roleProps.relative_volume * 100).toFixed(0)}% more on topic tweets
          than other leaders
        </Typography>
        <Typography variant="body2" component="li" gutterBottom>
          {/*userProps.topical_sentiment */ 100}% more positive than other
          leaders
        </Typography>
        <Typography variant="body2" component="li" gutterBottom>
          {parseFloat(roleProps.topical_retweets.toString()) * 100}% of tweets
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
          Topic:{" "}
          <Link
            onClick={handleNavigateTopic}
            color="inherit"
            variant="h6"
            gutterBottom
            activeStyle={{ color: "#00acee" }}
          >
            {topicProps.name}
          </Link>
        </Typography>
        <Typography variant="body2" component="p" gutterBottom>
          Role: {toTitleCase(roleProps.persona)}
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
  data: PropTypes.object
};

export default UserInsightCard;
