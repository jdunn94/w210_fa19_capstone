import React from "react";
import "./App.css";
import {
  AboutTechnology,
  Home,
  Explore,
  Results,
  User,
  Hashtag,
  Tweet
} from "./views";
import { Neo4jDriver } from "./services";
import { withLayout } from "./withLayout";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from '@material-ui/core/styles';

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#0091ea" },
    secondary: { main: '#11cb5f' },
  },
});

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Neo4jDriver>
          <Router>
            <Switch>
              <Route
                path="/results/:location/:topic/:id?"
                component={withLayout(Results)}
              />
              <Route path="/user/:name" component={withLayout(User)} />
              <Route
                path="/hashtag/:name/:topic/:location"
                component={withLayout(Hashtag)}
              />
              <Route path="/tweet/:id/" component={withLayout(Tweet)} />
              <Route path="/explore" component={withLayout(Explore)} />
              <Route
                path="/technology"
                component={withLayout(AboutTechnology)}
              />
              <Route path="/" component={withLayout(Home)} />
            </Switch>
          </Router>
        </Neo4jDriver>
      </ThemeProvider>
    </div>
  );
}

export default App;
