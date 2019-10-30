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
            America's legacy of institutional racism, sexism,
            socioeconomic inequality, homophobia, transphobia, and xenophobia
            (just to name a few) provides an overwhelming buffet of social
            problems that urgently need to be solved. Many public sector and
            nonprofit organizations are working overtime to solve these
            challenges and are just beginning to tap into the power of social
            network data at scale to aid their efforts. Today there is a digital
            divide between organizations that have assets, talent and expertise
            to leverage digital data to drive operational efficiency and the
            majority of those who do not have this capacity- small and medium
            sized organizations. We seek to make social media data accessible to
            organizations who don't have the resources to gather and process it,
            and in doing so, possibly connect organizations of all sizes to real
            people who care about their causes.
          </Typography>
          <br />
          <Typography variant="h3" align="left" gutterBottom>
            The Product
          </Typography>
          <Typography align="left">
            mic-check.ai was developed to augment the research and
            design phase of social good programs. By scouring Twitter for
            community approved thought leaders, this application provides
            program managers with a snapshot overview of how social issues are
            currently impacting communities across the United States.
            mic-check.ai leverages machine learning techniques, including
            sentiment and social network analysis, to build user profiles across
            a variety of metropolitan areas.
          </Typography>
          <br />
          <Typography variant="h3" align="left" gutterBottom>
            The Team
          </Typography>
          <Typography align="left">
            We are a group of UC Berkeley graduate students interested
            in the intersection of social good and data science. Please hire us.
          </Typography>
        </div>
      </Paper>
    </div>
  );
};

export default About;
