import React from "react";
import "./about.css";

import { Typography, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  page: {
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    "flex-grow": 1,
    position: "relative"
  },
  paper: {
    width: "80%",
    height: "80%",
    padding: "10px"
  },
  body: {
    "align-items": "left"
  }
}));

const About = props => {
  const classes = useStyles();

  return (
    <div className={classes.page}>
      <Paper className={classes.paper}>
        <Typography variant="h2" gutterBottom>
          About Mic-Check.AI
        </Typography>
        <div className={classes.body}>
          <Typography variant="h3" align="left" gutterBottom>
            The Mission
          </Typography>
          <Typography align="left">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ut
            dolor ut erat sodales elementum. Curabitur euismod, arcu ac
            venenatis ornare, orci magna tristique ante, porta consectetur nulla
            nulla sit amet purus. Sed elementum odio vel ligula mollis faucibus.
            Praesent suscipit metus nec erat mattis faucibus. Nullam porta diam
            arcu, id pulvinar urna auctor ultrices. Etiam venenatis sem ligula,
            cursus aliquet nisi viverra quis. Nulla eget accumsan nunc. Praesent
            feugiat scelerisque elit non pulvinar.
          </Typography>
          <br />
          <Typography variant="h3" align="left" gutterBottom>
            The Product
          </Typography>
          <Typography  align="left">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ut
            dolor ut erat sodales elementum. Curabitur euismod, arcu ac
            venenatis ornare, orci magna tristique ante, porta consectetur nulla
            nulla sit amet purus. Sed elementum odio vel ligula mollis faucibus.
            Praesent suscipit metus nec erat mattis faucibus. Nullam porta diam
            arcu, id pulvinar urna auctor ultrices. Etiam venenatis sem ligula,
            cursus aliquet nisi viverra quis. Nulla eget accumsan nunc. Praesent
            feugiat scelerisque elit non pulvinar.
          </Typography>
          <br />
          <Typography variant="h3" align="left" gutterBottom>
            The Team
          </Typography>
          <Typography align="left">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ut
            dolor ut erat sodales elementum. Curabitur euismod, arcu ac
            venenatis ornare, orci magna tristique ante, porta consectetur nulla
            nulla sit amet purus. Sed elementum odio vel ligula mollis faucibus.
            Praesent suscipit metus nec erat mattis faucibus. Nullam porta diam
            arcu, id pulvinar urna auctor ultrices. Etiam venenatis sem ligula,
            cursus aliquet nisi viverra quis. Nulla eget accumsan nunc. Praesent
            feugiat scelerisque elit non pulvinar.
          </Typography>
        </div>
      </Paper>
    </div>
  );
};

export default About;
