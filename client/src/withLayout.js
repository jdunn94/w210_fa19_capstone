import React from "react";
import Header from "./views/Header";
import { makeStyles, Grid } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(1)
  },
  body: {
    minHeight: "100vh",
    display: "flex"
  },
  root: {
    backgroundColor: "#cfd8dc",
    minHeight: "100%",
    width: "100%"
  }
}));

export const withLayout = WrappedComponent => {
  return props => {
    const classes = useStyles();

    return (
      <Grid container className={classes.root} alignContent="flex-start">
        <Grid item xs={12}>
          <Header {...props} />
        </Grid>
        <Grid item container xs={12}>
          <WrappedComponent {...props} />
        </Grid>
      </Grid>
    );
  };
};
