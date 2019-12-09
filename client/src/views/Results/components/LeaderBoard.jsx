import React from "react";
import {
  Card,
  CardContent,
  Typography,
  makeStyles,
  ListItem,
  ListItemText
} from "@material-ui/core";
import HelpIcon from "@material-ui/icons/Help";
import { StyledTooltip } from "../../../components";

import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
const useStyles = makeStyles(theme => ({
  root: {
    height: "100%",
    width: "100%"
  },
  title: {
    fontSize: 20
  },
  dataCount: {
    fontSize: 20
  }
}));

const LeaderBoard = props => {
  const classes = useStyles();

  function renderRow(p) {
    const { index, style } = p;

    const handleClick = () => {
      props.history.push(
        "/user/" + props.data[index].get("users").properties.screen_name
      );
    };
    return (
      <ListItem button style={style} key={index} onClick={handleClick}>
        <ListItemText
          primary={`(${index + 1}) ${
            props.data[index].get("users").properties.name
          }`}
          primaryTypographyProps={{ noWrap: true }}
        />
      </ListItem>
    );
  }

  const dataList =
    props.data.length === 0 ? (
      <Typography>No users in this role</Typography>
    ) : (
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={150}
            width={width}
            itemSize={24}
            itemCount={props.data.length}
          >
            {renderRow}
          </FixedSizeList>
        )}
      </AutoSizer>
    );

  return (
    <Card className={classes.root}>
      <CardContent>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <Typography
              className={classes.title}
              color="textPrimary"
              gutterBottom
            >
              {props.title}
            </Typography>
            <StyledTooltip arrow title={props.helperText}>
              <HelpIcon style={{ marginLeft: "10px" }} fontSize="small" />
            </StyledTooltip>
          </div>
          <Typography
            className={classes.dataCount}
            color="textSecondary"
            gutterBottom
          >
            {props.data.length}
          </Typography>
        </div>
        {dataList}
      </CardContent>
    </Card>
  );
};

export default LeaderBoard;
