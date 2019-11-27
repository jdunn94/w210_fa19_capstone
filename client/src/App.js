import React from "react";
import "./App.css";
import { Search, About, Results, User, Hashtag, Tweet, Header } from "./views";
import { Button } from "@material-ui/core";
import { Neo4jDriver } from "./services";
import { withLayout } from "./withLayout";

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
          <Switch>
            <Route path="/about" component={withLayout(About)} />
            <Route path="/results/:location/:topic/:id?" component={withLayout(Results)} />
            <Route
              path="/user/:name/:topic/:location"
              component={withLayout(User)}
            />
            <Route path="/hashtag/:name/:topic/:location" component={withLayout(Hashtag)} />
            <Route path="/tweet/:id/" component={withLayout(Tweet)} />
            <Route path="/:explore?" component={withLayout(Search)} />
          </Switch>
        </Router>
      </Neo4jDriver>
    </div>
  );
}

export default App;
