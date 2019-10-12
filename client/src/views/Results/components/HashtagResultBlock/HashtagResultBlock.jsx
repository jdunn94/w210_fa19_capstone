import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";

import { HashtagResultCard } from "../../components";
import { Skeleton } from "@material-ui/lab";

import { Neo4jContext } from "../../../../services";

const useStyles = makeStyles(theme => ({
  progress: {
    margin: theme.spacing(2)
  }
}));

const HashtagResultBlock = props => {
  const classes = useStyles();
  const driver = useContext(Neo4jContext);

  const [hashtags, updateHashtags] = useState([]);
  const [isHashtagsLoading, updateHashtagsLoading] = useState(false);

  useEffect(() => {
    const session = driver.session();
    updateHashtags(old => []);
    updateHashtagsLoading(true);
    session
      .run(
        `
        match (u:User)-[:TWEETED]->(t:Tweet)-[:TAGGED]->(h:Hashtag)
        where t.text_lower contains("${props.topic}")
        with distinct h.name as name, count(h.name) as counts
        where counts > 1
        return name, counts
        order by counts desc
      `
      )
      .subscribe({
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
  }, [props.topic]);

  const navigateHashtag = name => {
    props.history.push(`/hashtag/${name}`);
  };

  return isHashtagsLoading ? (
    <Skeleton variant="rect" height="100px" />
  ) : (
    <HashtagResultCard data={hashtags} navigateHashtag={navigateHashtag} />
  );
};

export default HashtagResultBlock;
