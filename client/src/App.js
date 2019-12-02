import React from "react";
import "./App.css";
import { AboutTechnology, Home, Explore, Results, User, Hashtag, Tweet } from "./views";
import { Neo4jDriver } from "./services";
import { withLayout } from "./withLayout";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Neo4jDriver>
        <Router>
          <Switch>
            <Route
              path="/results/:location/:topic/:id?"
              component={withLayout(Results)}
            />
            <Route
              path="/user/:name"
              component={withLayout(User)}
            />
            <Route
              path="/hashtag/:name/:topic/:location"
              component={withLayout(Hashtag)}
            />
            <Route path="/tweet/:id/" component={withLayout(Tweet)} />
            <Route path="/explore" component={withLayout(Explore)} />
            <Route path="/technology" component={withLayout(AboutTechnology)} />
            <Route path="/" component={withLayout(Home)} />
          </Switch>
        </Router>
      </Neo4jDriver>
    </div>
  );
}

export default App;
