import React from "react";
import Header from "./views/Header";
import { makeStyles } from "@material-ui/core";
import grey from '@material-ui/core/colors/grey';

const useStyles = makeStyles(theme => ({
  title: {
    flexGrow: 1
  },
  margin: {
    margin: theme.spacing(1)
  },
  body: {
    minHeight: "92vh",
    display: "flex"
  },
  root: {
      backgroundColor: grey[300]
  }
}));

export const withLayout = WrappedComponent => {
  return props => {
    const classes = useStyles();

    return (
      <div className={classes.root}>
        <Header {...props}/>
        <div className={classes.body}>
          <WrappedComponent {...props} />
        </div>
      </div>
    );
  };
};
