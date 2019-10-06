import React, { useState } from "react";
import "./App.css";
import { Search, About, Results } from "./views";
import Button from "@material-ui/core/Button";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink
} from "react-router-dom";

function App() {
  const Link = React.forwardRef((props, ref) => (
    <RouterLink innerRef={ref} {...props} />
  ));

  return (
    <div className="App">
      <Router>
        <div className="App-header">
          <Button color="secondary" component={Link} to="/">
            Home
          </Button>
          <Button color="secondary" component={Link} to="/about">
            About
          </Button>
        </div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <div className="App-main">
          <Switch>
            <Route path="/about" component={About} />
            <Route path="/results/:location/:topic" component={Results} />
            <Route path="/" component={Search} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
