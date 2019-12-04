import React from "react";
import PropTypes from "prop-types";

import { makeStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import { Card, Typography, CardContent, Link } from "@material-ui/core";
import { decodeEntities, toTitleCase } from "../../utilities";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

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
  },
  cell: {
    padding: "6px 24px 6px 16px"
  }
});

const UserInsightCard = props => {
  const classes = useStyles();

  console.log(props.data);
  const userProps = props.data.get("users").properties;
  const roleProps = props.data.get("role").properties;
  const topicProps = props.data.get("topic").properties;
  const localStatProps = props.data.get("local_stats");
  const allStatProps = props.data.get("all_stats");
  const hashtags = props.data.get("hashtags");

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
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "10%" }} className={classes.cell}>
              Dimension
            </TableCell>
            <TableCell
              style={{ width: "20%" }}
              className={classes.cell}
              align="right"
            >
              This User
            </TableCell>
            <TableCell
              style={{ width: "20%" }}
              className={classes.cell}
              align="right"
            >
              This Location
            </TableCell>
            <TableCell
              style={{ width: "20%" }}
              className={classes.cell}
              align="right"
            >
              All Locations
            </TableCell>
            <TableCell className={classes.cell} align="left">
              Outcome
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell className={classes.cell} component="th" scope="row">
              Topical Volume
            </TableCell>
            <TableCell className={classes.cell} align="right">
              {(roleProps.topical_volume * 100).toFixed(2)}%
            </TableCell>
            <TableCell className={classes.cell} align="right">
              mean:{" "}
              {!!localStatProps.topical_volume
                ? `${(localStatProps.topical_volume * 100).toFixed(2)}%`
                : "n/a"}
            </TableCell>
            <TableCell className={classes.cell} align="right">
              mean:{" "}
              {!!allStatProps.topical_volume
                ? `${(allStatProps.topical_volume * 100).toFixed(2)}%`
                : "n/a"}
            </TableCell>
            <TableCell className={classes.cell} align="left">
              {!localStatProps.topical_volume ||
              roleProps.topical_volume > 2 * localStatProps.topical_volume ? (
                <div>
                  <Typography variant="p">This is a </Typography>
                  <Typography variant="p" style={{ fontWeight: "bold" }}>
                    high volume of tweets
                  </Typography>
                  <Typography variant="p">
                    . This user may particularly be interested in this specific
                    topic more so than others in this group.
                  </Typography>
                </div>
              ) : (
                <div>
                  <Typography variant="p">This is an </Typography>{" "}
                  <Typography variant="p" style={{ fontWeight: "bold" }}>
                    average or low volume of tweets
                  </Typography>
                  <Typography variant="p">
                    . This user may occasionally tweet about this specific topic
                    but may not be focused on this one issue.
                  </Typography>
                </div>
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classes.cell} component="th" scope="row">
              Topical Retweets
            </TableCell>
            <TableCell className={classes.cell} align="right">
              {roleProps.topical_retweets.toString()}
            </TableCell>
            <TableCell className={classes.cell} align="right">
              mean:{" "}
              {!!localStatProps.topical_retweets
                ? localStatProps.topical_retweets.toFixed(0)
                : "n/a"}
            </TableCell>
            <TableCell className={classes.cell} align="right">
              mean:{" "}
              {!!allStatProps.topical_retweets
                ? allStatProps.topical_retweets.toFixed(0)
                : "n/a"}
            </TableCell>
            <TableCell className={classes.cell} align="left">
              {!localStatProps.topical_retweets ||
              roleProps.topical_retweets >
                2 * localStatProps.topical_retweets ? (
                <div>
                  <Typography variant="p">This is a </Typography>
                  <Typography variant="p" style={{ fontWeight: "bold" }}>
                    large amount of retweets
                  </Typography>
                  <Typography variant="p" style={{ fontWeight: "bold" }}>
                    . This user has considerable influence in their network.
                  </Typography>
                </div>
              ) : (
                <div>
                  <Typography variant="p">This is a </Typography>
                  <Typography variant="p" style={{ fontWeight: "bold" }}>
                    relatively small amount of retweets
                  </Typography>
                  <Typography variant="p">
                    . This user may not have as much influence in their network
                    as users in other networks.
                  </Typography>
                </div>
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classes.cell} component="th" scope="row">
              Common hashtags
            </TableCell>
            <TableCell className={classes.cell} align="right">
              {hashtags.length === 0 ? (
                <Typography variant="p">None</Typography>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {hashtags.map((a, i) => (
                    <Typography
                      key={i}
                      variant="p"
                    >{`#${a.properties.name} (${a.properties.topical_count})`}</Typography>
                  ))}
                </div>
              )}
            </TableCell>
            <TableCell className={classes.cell} align="right">
              {localStatProps.hashtags.length === 0 ? (
                <Typography variant="p">None</Typography>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {localStatProps.hashtags.slice(0, 4).map((a, i) => (
                    <Typography variant="p">{`#${a.properties.name} (${a.properties.topical_count})`}</Typography>
                  ))}
                </div>
              )}
            </TableCell>
            <TableCell className={classes.cell} align="right">
              {allStatProps.hashtags.length === 0 ? (
                <Typography variant="p">None</Typography>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {allStatProps.hashtags.slice(0, 4).map((a, i) => (
                    <Typography variant="p">{`#${a.properties.name} (${a.properties.topical_count})`}</Typography>
                  ))}
                </div>
              )}
            </TableCell>
            <TableCell className={classes.cell} align="left">
              {hashtags.length === 0 ? (
                <Typography variant="p">
                  This user hasn't used any hashtags on this topic.
                </Typography>
              ) : hashtags.length > 2 ? (
                <div>
                  <Typography variant="p">These are</Typography>
                  <Typography variant="p" style={{ fontWeight: "bold" }}>
                    very common hashtags
                  </Typography>
                  <Typography variant="p">
                    for this topic and location combination. This user may be
                    aligned with a larger movement or these hashtags could be
                    fairly generic.
                  </Typography>
                </div>
              ) : (
                <div>
                  <Typography variant="p">These are </Typography>
                  <Typography variant="p" style={{ fontWeight: "bold" }}>
                    very uncommon hashtags{" "}
                  </Typography>
                  <Typography variant="p">
                    for this topic and location combination. This may be a
                    unique hashtag and could be specific or could be nonsense.
                  </Typography>
                </div>
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
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
