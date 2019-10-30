import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Chip,
  CardActions,
  Button
} from "@material-ui/core";
import { blue } from "@material-ui/core/colors";

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
  },
  chips: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(0.5)
    }
  }
}));

const HashtagCard = props => {
  const classes = useStyles();

  const [state, updateState] = useState(20);

  const showAll = event => {
    updateState(100000);
  };
  const handleClick = event => {
    props.navigateHashtag(event.currentTarget.id);
  };

  const getColor = (max, current) => {
    const paletteNumber = Math.round(4 * (Number(current) / Number(max))) * 100;
    return blue[paletteNumber === 0 ? 50 : paletteNumber];
  };

  return (
    <Paper className={classes.card}>
      <div className={classes.chips}>
        {props.data.slice(0, state).map((ht, i) => (
          <Chip
            style={{
              backgroundColor: getColor(
                props.data[0].get("h").properties.topical_count.toString(),
                ht.get("h").properties.topical_count.toString()
              )
            }}
            key={i}
            size="small"
            id={ht.get("h").properties.name}
            onClick={handleClick}
            label={`${ht.get("h").properties.name} ${ht.get("h").properties.topical_count.toString()}`}
          />
        ))}
      </div>
      <CardActions></CardActions>
      <CardActions>
        <Typography component="p">
          Showing
          {state > props.data.length
            ? ` all ${props.data.length} hashtags`
            : ` ${state} of ${props.data.length} hashtags`}
        </Typography>
        {state < props.data.length && <Button size="small" onClick={showAll}>
          Show all
        </Button>}
      </CardActions>
    </Paper>
  );
};

export default HashtagCard;
