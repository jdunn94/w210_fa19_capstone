import React from "react";
import "./App.css";
import { Search, About, Results, User, Hashtag, Tweet } from "./views";
import Button from "@material-ui/core/Button";
import { Neo4jDriver } from "./services";

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
      <Neo4jDriver>
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
              <Route
                path="/results/:location/:topic/:id?"
                component={Results}
              />
              <Route path="/user/:id/" component={User} />
              <Route path="/hashtag/:name/" component={Hashtag} />
              <Route path="/tweet/:id/" component={Tweet} />
              <Route path="/:explore?" component={Search} />
            </Switch>
          </div>
        </Router>
      </Neo4jDriver>
    </div>
  );
}

export default App;
