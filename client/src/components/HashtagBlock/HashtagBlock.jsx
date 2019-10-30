import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";

import { HashtagCard } from "../";
import { Skeleton } from "@material-ui/lab";

import { Neo4jContext } from "../../services";

const useStyles = makeStyles(theme => ({
  progress: {
    margin: theme.spacing(2)
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 20px 0px 20px"
  },
}));

const HashtagBlock = props => {
  const classes = useStyles();
  const driver = useContext(Neo4jContext);

  const [hashtags, updateHashtags] = useState([]);
  const [isHashtagsLoading, updateHashtagsLoading] = useState(false);

  useEffect(() => {
    const session = driver.session();
    updateHashtags(old => []);
    updateHashtagsLoading(true);
    session.run(props.query).subscribe({
      onKeys: keys => {
        console.log("keys");
        console.log(keys);
      },
      onNext: record => {
        updateHashtags(oldHashtags => [...oldHashtags, record]);
      },
      onCompleted: () => {
        updateHashtagsLoading(false);
        session.close(); // returns a Promise
      },
      onError: error => {
        console.log(error);
      }
    });
  }, [props.query]);

  const navigateHashtag = name => {
    props.history.push(`/hashtag/${name}/${props.topic}/${props.location}`);
  };

  return isHashtagsLoading ? (
    <Skeleton variant="rect" height="100px" />
  ) : (
    <HashtagCard data={hashtags} navigateHashtag={navigateHashtag} expanded={props.expanded}/>
  );
};

export default HashtagBlock;
