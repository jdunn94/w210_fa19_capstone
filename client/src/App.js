import React, { useState } from "react";
import "./App.css";
import { Search, About } from "./views";
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
  const [showSearch, updateState] = useState(false);

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
            <Route path="/about">
              <About />
            </Route>
            <Route path="/">
              <Search />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
