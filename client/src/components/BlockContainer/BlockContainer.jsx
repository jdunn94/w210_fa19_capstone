import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Neo4jContext } from "../../services";

import PropTypes from "prop-types";
import { Skeleton } from "@material-ui/lab";

import { Typography, ButtonGroup, Button } from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";

const useStyles = makeStyles(theme => ({
  results: {
    display: "flex",
    flexDirection: "column"
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
    return (
      <div className={classes.results}>
        <Skeleton variant="rect" className={classes.resultCard} />
        <Skeleton variant="rect" className={classes.resultCard} />
        <Skeleton variant="rect" className={classes.resultCard} />
      </div>
    );
  }

  const itemsPage = items.slice(
    displayPage * props.pageSize,
    (1 + displayPage) * props.pageSize
  );

  let header = null;
  if (props.title && props.multiple) {
    header = (
      <div className={classes.header}>
        <Typography>
          {props.title}: {items.length} found
        </Typography>
        <div className={classes.pageNav}>
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
        </div>
      </div>
    );
  } else if (props.title) {
    header = (
      <div className={classes.header}>
        <Typography>{props.title}</Typography>
      </div>
    );
  }

  let children;
  if (props.noFlatten) {
    children = (
      <div
        className={classes.resultCard}
        style={{ minHeight: props.cardHeight }}
      >
        {React.cloneElement(props.children, {
          data: itemsPage
        })}
      </div>
    );
  } else {
    children = itemsPage.map((item, i) => (
      <div
        key={i}
        className={classes.resultCard}
        style={{ minHeight: props.cardHeight }}
      >
        {React.cloneElement(props.children, {
          data: item
        })}
      </div>
    ));
  }
  return (
    <div>
      {header}
      <div className={classes.results}>{children}</div>
    </div>
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
