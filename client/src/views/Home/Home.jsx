import React from "react";
import { Helmet } from "react-helmet";
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
    padding: "10px",
    marginTop: theme.spacing(2)
  },
  body: {
    "align-items": "left"
  }
}));

const Home = props => {
  const classes = useStyles();

  return (
    <div className={classes.page}>
      <Helmet>
        <title>mic-check.ai</title>
      </Helmet>
      <Paper className={classes.paper}>
        <Typography
          variant="h2"
          gutterBottom
          style={{ textAlign: "center", color: "#0091ea" }}
        >
          mic-check.ai
        </Typography>
        <Typography style={{ textAlign: "center", color: "#607d8b" }}>
          Connecting nonprofits to the communities they serve
        </Typography>
        <div className={classes.body}>
          <Typography variant="h5" align="left" gutterBottom>
            The Mission
          </Typography>
          <Typography align="left">
            America's legacy of institutional racism, sexism, socioeconomic
            inequality, homophobia, transphobia, and xenophobia (just to name a
            few) provides an overwhelming buffet of social problems that
            urgently need to be solved. Many public sector and nonprofit
            organizations are working overtime to solve these challenges and are
            just beginning to tap into the power of social network data at scale
            to aid their efforts. Today there is a digital divide between
            organizations that have assets, talent and expertise to leverage
            digital data to drive operational efficiency and the majority of
            those who do not have this capacity- small and medium sized
            organizations. We seek to make social media data accessible to
            organizations who don't have the resources to gather and process it,
            and in doing so, possibly connect organizations of all sizes to real
            people who care about their causes.
          </Typography>
          <br />
          <Typography variant="h5" align="left" gutterBottom>
            The Product
          </Typography>
          <Typography align="left">
            mic-check.ai leverages machine learning techniques to build user
            profiles across a variety of major metropolitan areas with the goal
            of augmenting the research and design phase of social good programs.
            By compressing the Twitter graph into community-oriented user
            networks, this application provides program managers with a snapshot
            overview of how social issues are currently impacting communities
            across the United States.
          </Typography>
          <br />
          <Typography variant="h5" align="left" gutterBottom>
            The Team
          </Typography>
          <Typography align="left">
            We are a group of UC Berkeley Masters of Information and Data
            Science candidates interested in the intersection of social good and
            data science. This four month capstone project has given us
            experience in product management, data engineering, machine learning
            at scale, and front-end development.
          </Typography>
        </div>
      </Paper>
    </div>
  );
};

export default Home;
