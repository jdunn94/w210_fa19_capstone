import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Typography, Button } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  card: {
    minWidth: 275,
    padding: theme.spacing(2)
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  },
  button: {
    textTransform: "none"
  },
  buttonPanel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "baseline"
  }
}));

const HashtagResultCard = props => {
  const classes = useStyles();

  const handleClick = event => {
    props.navigateHashtag(event.currentTarget.id);
  };

  return (
    <Paper className={classes.card}>
      <Typography variant="h5" component="h3" gutterBottom>
        Common hashtags:
      </Typography>
      <div className={classes.buttonPanel}>
        {props.data.map((ht, i) => (
          <Button
            className={classes.button}
            size="small"
            key={i}
            id={ht.get("name")}
            onClick={handleClick}
          >
            {ht.get("name")} {ht.get("counts").toString()}
          </Button>
        ))}
      </div>
    </Paper>
  );
};

export default HashtagResultCard;
