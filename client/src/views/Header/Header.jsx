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
import Autocomplete from "@material-ui/lab/Autocomplete";
import { locations, topics } from "./searchOptions";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import SearchIcon from "@material-ui/icons/Search";
import MenuIcon from "@material-ui/icons/Menu";
import clsx from "clsx";

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
  },
  toolbar: {
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2)
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  color: {
    color: "white"
  },
  notchedOutline: {
    borderColor: "white !important"
  }
}));

const Header = props => {
  const classes = useStyles();

  const [topic, updateTopic] = useState(props.match.params.topic);
  const [location, updateLocation] = useState(props.match.params.location);

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

  const navigatePage = event => {
    setAnchorEl(null);
    props.history.push("/" + event.target.id);
  };

  const handleSearch = () => {
    props.history.push(`/results/${location}/${topic}`);
  };

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <Grid container>
          <Grid container item md={2} alignItems="center">
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
                <MenuItem id="home" onClick={navigatePage}>
                  Home
                </MenuItem>
                <MenuItem id="explore" onClick={navigatePage}>
                  Explore
                </MenuItem>
                <MenuItem id="technology" onClick={navigatePage}>
                  Technology
                </MenuItem>
              </Menu>
            </Grid>
            <Grid item>
              <Typography variant="h6" className={classes.title}>
                mic-check.ai
              </Typography>
            </Grid>
          </Grid>
          <Grid container item direction="row" md={10} justify="flex-end">
            <Grid item>
              <Autocomplete
                id="combo-box-demo"
                options={topics}
                getOptionLabel={option => option}
                style={{ width: 300, color: "white" }}
                onChange={handleChangeTopic}
                value={topic}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Topic"
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    InputProps={{
                      ...params.InputProps,
                      className: clsx(
                        "MuiAutocomplete-inputRootDense",
                        classes.color
                      ),
                      classes: {
                        notchedOutline: classes.notchedOutline
                      }
                    }}
                    InputLabelProps={{
                      classes: {
                        root: classes.color
                      }
                    }}
                  />
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
                style={{ width: 450 }}
                onChange={handleChangeLocation}
                value={location}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Location"
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    InputProps={{
                      ...params.InputProps,
                      className: clsx(
                        "MuiAutocomplete-inputRootDense",
                        classes.color
                      ),
                      classes: {
                        notchedOutline: classes.notchedOutline
                      }
                    }}
                    InputLabelProps={{
                      classes: {
                        root: classes.color
                      }
                    }}
                  />
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
                <SearchIcon fontSize="small" />
              </Fab>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
