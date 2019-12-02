import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Neo4jContext } from "../../services";

import PropTypes from "prop-types";
import { Skeleton } from "@material-ui/lab";

import { Typography, ButtonGroup, Button, Grid, Card } from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";

const useStyles = makeStyles(theme => ({
  resultCard: {
    minWidth: "100%",
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
    padding: "0px 20px 0px 20px",
    height: "32px",
    width:"100%"
  },
  pageNav: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  cardHolder: {
    width: "100%"
  }
}));

const BlockContainer = props => {
  const classes = useStyles();
  const driver = useContext(Neo4jContext);

  const [items, updateItems] = useState([]);
  const [displayPage, updatePage] = useState(0);
  const [isLoading, updateLoading] = useState(true);

    useEffect(() => {
    const session = driver.session();
    updateItems(old => []);
    updateLoading(true);
    session.run(props.query).subscribe({
      onKeys: keys => {
        console.log("keys");
        console.log(keys);
      },
      onNext: record => {
        updateItems(old => [...old, record]);
      },
      onCompleted: () => {
        updateLoading(false);
        session.close(); // returns a Promise
      },
      onError: error => {
        console.log(error);
      }
    });
  }, [props.query, driver]);

  if (isLoading) {
    const count = props.noFlatten ? [0] : [0, 1, 2];
    return (
      <Grid container item className={classes.results} direction="column" spacing={2}>
        {props.title && (
          <Grid item className={classes.header}>
            <Skeleton variant="text" className={classes.header} />
          </Grid>
        )}
        {count.map((a, i) => (
          <Grid item key={i}>
            <Skeleton variant="rect" className={classes.resultCard} />
          </Grid>
        ))}
      </Grid>
    );
  }

  console.log(items);
  if (items.length === 0) {
    return (
      <Card style={{ width: "100%" }}>
        <Typography>No results</Typography>
      </Card>
    );
  }

  const itemsPage = items.slice(
    displayPage * props.pageSize,
    (1 + displayPage) * props.pageSize
  );

  let header = null;
  if (props.title && props.multiple) {
    header = (
      <Grid container item justify="space-between" alignItems="baseline">
        <Typography>
          {props.title}: {items.length} found
        </Typography>
        <Grid item className={classes.pageNav}>
          <Typography>
            Page {displayPage + 1} / {Math.ceil(items.length / props.pageSize)}
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
              disabled={items.length <= (1 + displayPage) * props.pageSize}
            >
              <NavigateNextIcon />
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  } else if (props.title) {
    header = (
      <Grid item className={classes.header}>
        <Typography>{props.title}</Typography>
      </Grid>
    );
  }

  let children;
  if (props.noFlatten) {
    children = (
      <Grid item>
        {React.cloneElement(props.children, {
          data: itemsPage
        })}
      </Grid>
    );
  } else {
    children = (
      <Grid
        container
        item
        spacing={1}
        justify="flex-start"
        alignItems="flex-start"
        direction="column"
        xs={12}
        width={"100%"}
      >
        {itemsPage.map((item, i) => (
          <Grid item key={i} xs={12} className={classes.cardHolder}>
            {React.cloneElement(props.children, {
              data: item
            })}
          </Grid>
        ))}
      </Grid>
    );
  }
  return (
    <Grid
      container
      item
      spacing={1}
      justify="flex-start"
      alignItems="flex-start"
      direction="row"
      className={classes.results}
      sm={12}
    >
      {header}
      {children}
    </Grid>
  );
};

BlockContainer.propTypes = {
  query: PropTypes.string.isRequired,
  cardHeight: PropTypes.string.isRequired,
  title: PropTypes.string,
  multiple: PropTypes.bool,
  pageSize: PropTypes.number,
  noFlatten: PropTypes.bool
};

BlockContainer.defaultProps = {
  pageSize: 20,
  noFlatten: false
};

export default BlockContainer;
