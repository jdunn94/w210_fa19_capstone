import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  makeStyles,
  TextField,
  Fab,
  IconButton,
  Menu,
  MenuItem
} from "@material-ui/core";
import { indigo } from "@material-ui/core/colors";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { locations, topics } from "./searchOptions";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import SearchIcon from "@material-ui/icons/Search";
import MenuIcon from "@material-ui/icons/Menu";

const ITEM_HEIGHT = 48;

const useStyles = makeStyles(theme => ({
  title: {
    flexGrow: 1
  },
  selectors: {
    width: "fit-content",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "#cddaff",
    color: theme.palette.text.secondary,
    "& svg": {
      margin: theme.spacing(2)
    },
    "& hr": {
      margin: theme.spacing(0, 0.5)
    }
  },
  margin: {
    margin: theme.spacing(1)
  }
}));

const Header = props => {
  const classes = useStyles();

  const [topic, updateTopic] = useState(props.match.params.topic);
  const [location, updateLocation] = useState(props.match.params.location);

  const handleChange = event => {
    if (event.target.id === "topic") {
      updateTopic(event.target.value);
    } else if (event.target.id === "location") {
      updateLocation(event.target.value);
    }
  };

  const handleChangeTopic = (event, value) => {
    updateTopic(value);
  };

  const handleChangeLocation = (event, value) => {
    updateLocation(value);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = () => {
    props.history.push(`/results/${location}/${topic}`);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Grid container>
          <Grid container item md={3} alignItems="center">
            <Grid item>
              <IconButton
                edge="start"
                className={classes.menuButton}
                color="inherit"
                aria-label="menu"
                onClick={handleClick}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center"
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center"
                }}
                keepMounted
                open={open}
                onClose={handleClose}
                PaperProps={{
                  style: {
                    maxHeight: ITEM_HEIGHT * 4.5,
                    width: 200
                  }
                }}
              >
                <MenuItem onClick={handleClose}>About</MenuItem>
                <MenuItem onClick={handleClose}>The Technology</MenuItem>
              </Menu>
            </Grid>
            <Grid item>
              <Typography variant="h6" className={classes.title}>
                Mic-Check.AI
              </Typography>
            </Grid>
          </Grid>
          <Grid item md={4} />
          <Grid
            container
            item
            alignItems="center"
            className={classes.selectors}
            direction="row"
            md={5}
            justify="flex-end"

          >
            <Grid item>
              <Autocomplete
                id="combo-box-demo"
                options={topics}
                getOptionLabel={option => option}
                style={{ width: 200 }}
                onChange={handleChangeTopic}
                value={topic}
                renderInput={params => (
                  <TextField {...params} fullWidth helperText="Topic" />
                )}
              />
            </Grid>
            <Grid item>
              <Divider orientation="vertical" variant="middle" />
            </Grid>
            <Grid item>
              <Autocomplete
                id="combo-box-demo"
                options={locations}
                getOptionLabel={option => option}
                style={{ width: 300 }}
                onChange={handleChangeLocation}
                value={location}
                renderInput={params => (
                  <TextField {...params} fullWidth helperText="Location" />
                )}
              />
            </Grid>
            <Grid item>
              <Fab
                color="secondary"
                aria-label="search"
                className={classes.margin}
                size="small"
                disabled={!topic || !location}
                onClick={handleSearch}
              >
                <SearchIcon />
              </Fab>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
