import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";

import { UserCard } from "../";
import { Skeleton } from "@material-ui/lab";

import { Neo4jContext } from "../../services";
import { Typography, ButtonGroup, Button } from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";

const useStyles = makeStyles(theme => ({
  results: {
    display: "flex",
    flexDirection: "column"
  },
  expandedResultCard: {
    margin: theme.spacing(2),
    minHeight: "750px"
  },
  resultCard: {
    margin: theme.spacing(2),
    minHeight: "275px"
  },
  button: {
    margin: theme.spacing(0)
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 20px 0px 20px"
  },
  pageNav: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  }
}));

const UserBlock = props => {
  const classes = useStyles();
  const driver = useContext(Neo4jContext);

  const [users, updateUsers] = useState([]);
  const [displayPage, updatePage] = useState(0);
  const [isUsersLoading, updateUsersLoading] = useState(true);

  useEffect(() => {
    const session = driver.session();
    updateUsers(old => []);
    updateUsersLoading(true);
    session.run(props.query).subscribe({
      onKeys: keys => {
        console.log("keys");
        console.log(keys);
      },
      onNext: record => {
        updateUsers(oldUsers => [...oldUsers, record]);
      },
      onCompleted: () => {
        updateUsersLoading(false);
        session.close(); // returns a Promise
      },
      onError: error => {
        console.log(error);
      }
    });
  }, [props.query]);

  const navigateUser = (screenName, topic, location) => {
    props.history.push(`/user/${screenName}/${topic}/${location}`);
  };

  if (!props.expanded) {
    if (isUsersLoading) {
      return (
        <div className={classes.results}>
          <Skeleton variant="rect" className={classes.resultCard} />
          <Skeleton variant="rect" className={classes.resultCard} />
          <Skeleton variant="rect" className={classes.resultCard} />
        </div>
      );
    }

    const userSlice = users.slice(displayPage * 20, (1 + displayPage) * 20);

    return (
      <div className={classes.results}>
        <div className={classes.header}>
          <Typography>User Community: {users.length} users</Typography>
          <div className={classes.pageNav}>
            <Typography>
              Page {displayPage + 1} / {Math.ceil(users.length / 20)}
            </Typography>
            <ButtonGroup size="small" variant="text" color="primary">
              <Button
                id="previous-page"
                className={classes.button}
                aria-label="last page"
                onClick={() => updatePage(displayPage - 1)}
                disabled={displayPage === 0}
              >
                <NavigateBeforeIcon />
              </Button>
              <Button
                id="next-page"
                className={classes.button}
                aria-label="next page"
                onClick={() => updatePage(displayPage + 1)}
                disabled={users.length <= (1 + displayPage) * 20}
              >
                <NavigateNextIcon />
              </Button>
            </ButtonGroup>
          </div>
        </div>
        {userSlice.map((userResult, i) => (
          <div key={i} className={classes.resultCard}>
            <UserCard
              data={userResult}
              navigateUser={navigateUser}
              expanded={false}
              topic={props.topic}
              location={props.location}
            />
          </div>
        ))}
      </div>
    );
  }

  if (isUsersLoading) {
    return (
      <div className={classes.results}>
        <Skeleton variant="rect" className={classes.expandedResultCard} />
      </div>
    );
  }

  console.log(users);

  return (
    <div className={classes.results}>
      <div className={classes.expandedResultCard}>
        <UserCard
          data={users[0]}
          navigateUser={navigateUser}
          expanded={true}
          topic={props.topic}
          location={props.location}
        />
      </div>
    </div>
  );
};

export default UserBlock;
