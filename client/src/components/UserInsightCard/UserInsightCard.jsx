import React from "react";
import PropTypes from "prop-types";

import { makeStyles } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";
import {
  Card,
  Typography,
  CardContent,
  Link,
  SvgIcon
} from "@material-ui/core";
import { decodeEntities, toTitleCase, percentRank } from "../../utilities";

import VolumeMuteIcon from "@material-ui/icons/VolumeMute";
import VolumeDownIcon from "@material-ui/icons/VolumeDown";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { Boxplot, computeBoxplotStats } from "../Boxplot";
// import { Boxplot, computeBoxplotStats } from "react-boxplot";
import StyledTooltip from "../StyledTooltip";

import { mdiHelpRhombus } from "@mdi/js";

import heart from "./heart.png";
import retweet from "./retweet.png";

const useStyles = makeStyles({
  boxplot: {
    color: "red"
  },
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
  cell: {
    padding: "6px 24px 6px 16px"
  },
  entrySubtitle: {
    fontFamily: "Arial, sans-serif !important",
    //maxWidth: "300px !important",
    color: "#7a7a7a",
    fontSize: "14px"
  },
});

const UserInsightCard = props => {
  const classes = useStyles();

  const userProps = props.data.get("users").properties;
  const roleProps = props.data.get("role").properties;
  const topicProps = props.data.get("topic").properties;
  const localStatProps = props.data.get("local_stats");
  const allStatProps = props.data.get("all_stats");
  const hashtags = props.data.get("hashtags");

  const local_stats = {
    topical_volume: {
      absolute: roleProps.topical_volume
    },
    topical_retweets: {
      absolute: roleProps.topical_retweets.toInt()
    }
  };

  if (localStatProps.topical_volume.length > 0) {
    const values = localStatProps.topical_volume;
    local_stats.topical_volume = {
      ...local_stats.topical_volume,
      ...computeBoxplotStats(values),
      count: values.length,
      percentile: percentRank(
        localStatProps.topical_volume,
        roleProps.topical_volume
      ),
      values
    };
  }

  if (localStatProps.topical_retweets.length > 0) {
    const values = localStatProps.topical_retweets.map(a => a.toInt());
    local_stats.topical_retweets = {
      ...local_stats.topical_retweets,
      ...computeBoxplotStats(values),
      count: values.length,
      percentile: percentRank(
        localStatProps.topical_retweets,
        roleProps.topical_retweets
      ),
      values
    };
  }

  const all_stats = {
    topical_volume: {
      absolute: roleProps.topical_volume
    },
    topical_retweets: {
      absolute: roleProps.topical_retweets.toInt()
    }
  };

  if (allStatProps.topical_volume.length > 0) {
    const values = allStatProps.topical_volume;
    all_stats.topical_volume = {
      ...all_stats.topical_volume,
      ...computeBoxplotStats(values),
      count: values.length,
      percentile: percentRank(
        allStatProps.topical_volume,
        roleProps.topical_volume
      ),
      values
    };
  }

  if (allStatProps.topical_retweets.length > 0) {
    const values = allStatProps.topical_retweets.map(a => a.toInt());
    all_stats.topical_retweets = {
      ...all_stats.topical_retweets,
      ...computeBoxplotStats(values),
      count: values.length,
      percentile: percentRank(
        allStatProps.topical_retweets,
        roleProps.topical_retweets
      ),
      values
    };
  }

  const handleNavigateTopic = () => {
    props.history.push("/results/All%20Locations/" + topicProps.name);
  };

  const comparisonCell = (stats, precision) => {
    const helper =
      stats.values && stats.values.length > 3 ? (
        <div>
          <Boxplot
            width={200}
            height={40}
            orientation="horizontal"
            min={Math.min(...stats.values) * 0.9}
            max={Math.max(...stats.values) * 1.1}
            stats={stats}
          />
          <div>
            <Typography variant="caption">
              User Value: {stats.absolute.toFixed(precision)}
            </Typography>
            <br />
            <Typography variant="caption">
              User Percentile: {(stats.percentile * 100).toFixed(0)}
            </Typography>
            <br />
            <Typography variant="caption">
              Min: {Math.min(...stats.values).toFixed(precision)}
            </Typography>
            <br />
            <Typography variant="caption">
              Q1: {stats.quartile1.toFixed(precision)}
            </Typography>
            <br />
            <Typography variant="caption">
              Median: {stats.quartile2.toFixed(precision)}
            </Typography>
            <br />
            <Typography variant="caption">
              Mean:{" "}
              {(
                stats.values.reduce((a, b) => a + b, 0) / stats.values.length
              ).toFixed(precision)}
            </Typography>
            <br />
            <Typography variant="caption">
              Q3: {stats.quartile3.toFixed(precision)}
            </Typography>
            <br />
            <Typography variant="caption">
              Max: {Math.max(...stats.values).toFixed(precision)}
            </Typography>
            <br />
            <Typography variant="caption">Count: {stats.count}</Typography>
          </div>
        </div>
      ) : (
        <div>
          <Typography variant="caption">
            Not enough data for statistics
          </Typography>
          <br />
          <Typography variant="caption">
            User Value: {stats.absolute.toFixed(precision)}
          </Typography>
          {stats.values && <br />}
          {stats.values && (
            <Typography variant="caption">
              Mean:{" "}
              {(
                stats.values.reduce((a, b) => a + b, 0) / stats.values.length
              ).toFixed(precision)}
            </Typography>
          )}
          {stats.count && <br />}
          {stats.count && (
            <Typography variant="caption">Count: {stats.count}</Typography>
          )}
        </div>
      );

    const icon = !stats ? (
      <SvgIcon>
        <path d={mdiHelpRhombus} />
      </SvgIcon>
    ) : stats.absolute <= stats.quartile1 ? (
      <VolumeMuteIcon htmlColor="red" />
    ) : stats.absolute >= stats.quartile3 ? (
      <VolumeUpIcon htmlColor="green" />
    ) : (
      <VolumeDownIcon htmlColor="#F2D63D" />
    );

    return (
      <StyledTooltip arrow title={helper}>
        {icon}
      </StyledTooltip>
    );
  };

  const hashtagCell = (user, population) => {
    const populationValues = population.map(a =>
      a.properties.topical_count.toInt()
    );
    const popStats =
      populationValues.length === 0
        ? null
        : {
            ...computeBoxplotStats(populationValues),
            values: populationValues
          };

    const helper = !popStats ? (
      <Typography variant="caption">
        No hashtags used in this population.
      </Typography>
    ) : user.length === 0 ? (
      <Typography variant="caption">No hashtags for this user.</Typography>
    ) : (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>
          <Typography variant="subtitle2">
            Hashtag topical count statistics
          </Typography>
        </div>
        <Boxplot
          width={200}
          height={40}
          orientation="horizontal"
          min={Math.min(...popStats.values) * 0.9}
          max={Math.max(...popStats.values) * 1.1}
          stats={popStats}
        />
        <div>
          <Typography variant="caption">
            Min: {Math.min(...popStats.values).toFixed(0)}
          </Typography>
          <br />
          <Typography variant="caption">
            Q1: {popStats.quartile1.toFixed(0)}
          </Typography>
          <br />
          <Typography variant="caption">
            Median: {popStats.quartile2.toFixed(0)}
          </Typography>
          <br />
          <Typography variant="caption">
            Mean:{" "}
            {(
              popStats.values.reduce((a, b) => a + b, 0) /
              popStats.values.length
            ).toFixed(0)}
          </Typography>
          <br />
          <Typography variant="caption">
            Q3: {popStats.quartile3.toFixed(0)}
          </Typography>
          <br />
          <Typography variant="caption">
            Max: {Math.max(...popStats.values).toFixed(0)}
          </Typography>
          <br />
          <Typography variant="caption">
            Count: {popStats.values.length}
          </Typography>
        </div>
        <br />
        <div style={{display: "flex", flexDirection: "column"}}>
          <Typography variant="subtitle2">User hashtags</Typography>
          <Typography variant="caption">
            rank / hashtag / topical count
          </Typography>
          {hashtags.map((a, i) => (
            <Typography key={i} variant="caption">
              {`${population.findIndex(
                b => b.properties.name === a.properties.name
              ) + 1}: #${a.properties.name} (${a.properties.topical_count})`}
            </Typography>
          ))}
        </div>
      </div>
    );

    const userP =
      user.length === 1
        ? user[0].properties.topical_count
        : user.reduce((a, b) => a + b.properties.topical_count, 0);
    const popP =
      population.length === 1
        ? population[0].properties.topical_count
        : population.reduce((a, b) => a + b.properties.topical_count, 0);
    const percentage = userP / popP;
    const icon =
      population.length === 0 ? (
        <span>n/a</span>
      ) : percentage <= 0.25 ? (
        <VolumeMuteIcon htmlColor="red" />
      ) : percentage >= 0.75 ? (
        <VolumeUpIcon htmlColor="green" />
      ) : (
        <VolumeDownIcon htmlColor="#F2D63D" />
      );

    return (
      <StyledTooltip arrow title={helper}>
        {icon}
      </StyledTooltip>
    );
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
          {text}
        </Typography>
	<Typography gutterBottom className={classes.entrySubtitle}>
	    <img src={heart} alt="Heart" style={{ marginRight: "4px" }} />
	    Favorites: {favorites} | 
	    <img src={retweet} alt="Retweet"/>
	    Retweets: {retweets} | {created} 
    	</Typography>
      </div>
    );
  };
  const insights = (
    <div>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell style={{ width: "18%" }} className={classes.cell}>
              Dimension
            </TableCell>
            <TableCell
              style={{ width: "18%" }}
              className={classes.cell}
              align="center"
            >
              User location
            </TableCell>
            <TableCell
              style={{ width: "18%" }}
              className={classes.cell}
              align="center"
            >
              All locations
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
            <TableCell className={classes.cell} align="center">
              {comparisonCell(local_stats.topical_volume, 2)}
            </TableCell>
            <TableCell className={classes.cell} align="center">
              {comparisonCell(all_stats.topical_volume, 2)}
            </TableCell>
            <TableCell className={classes.cell} align="left">
              {!local_stats.topical_volume.values ? (
                <div>
                  There is too little data for this community to make an
                  inference.
                </div>
              ) : roleProps.topical_volume >=
                local_stats.topical_volume.quartile3 ? (
                <div>
                  This is a <b>high volume of tweets</b>. This user may
                  particularly be interested in this specific topic more so than
                  others in this group.
                </div>
              ) : roleProps.topical_volume <=
                local_stats.topical_volume.quartile1 ? (
                <div>
                  This is an <b>average or low volume of tweets</b>. This user
                  may occasionally tweet about this specific topic but may not
                  be focused on this one issue.
                </div>
              ) : (
                <div>
                  This is a <b>typical volume of tweets</b>.
                </div>
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classes.cell} component="th" scope="row">
              Topical Retweets
            </TableCell>
            <TableCell className={classes.cell} align="center">
              {comparisonCell(local_stats.topical_retweets, 0)}
            </TableCell>
            <TableCell className={classes.cell} align="center">
              {comparisonCell(all_stats.topical_retweets, 0)}
            </TableCell>
            <TableCell className={classes.cell} align="left">
              {!local_stats.topical_retweets.values ? (
                <div>
                  There is too little data for this community to make an
                  inference.
                </div>
              ) : roleProps.topical_retweets >=
                local_stats.topical_retweets.quartile3 ? (
                <div>
                  This is a <b>large amount of retweets</b>. This user has
                  considerable influence in their network.
                </div>
              ) : roleProps.topical_retweets <=
                local_stats.topical_retweets.quartile1 ? (
                <div>
                  This is a<b>relatively small amount of retweets</b>. This user
                  may not have as much influence in their network as users in
                  other networks.
                </div>
              ) : (
                <div>
                  This is a <b>typical amount of tweets</b>.
                </div>
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={classes.cell} component="th" scope="row">
              Common hashtags
            </TableCell>
            <TableCell className={classes.cell} align="center">
              {hashtagCell(hashtags, localStatProps.hashtags)}
            </TableCell>
            <TableCell className={classes.cell} align="center">
              {hashtagCell(hashtags, allStatProps.hashtags)}
            </TableCell>
            <TableCell className={classes.cell} align="left">
              {hashtags.length === 0 ? (
                <div>This user hasn't used any hashtags on this topic.</div>
              ) : hashtags.length > 2 ? (
                <div>
                  These are <b>very common hashtags</b>for this topic and
                  location combination. This user may be aligned with a larger
                  movement or these hashtags could be fairly generic.
                </div>
              ) : (
                <div>
                  These are <b>very uncommon hashtags</b> for this topic and
                  location combination. This may be a unique hashtag and could
                  be specific or could be nonsense.
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
