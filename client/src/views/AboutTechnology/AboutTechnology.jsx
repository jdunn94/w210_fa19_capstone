import React from "react";
import { Helmet } from "react-helmet";
import { Typography, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  page: {
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    "flex-grow": 1,
    position: "relative"
  },
  paper: {
    width: "80%",
    padding: "10px",
    marginTop: theme.spacing(2)
  },
  body: {
    "align-items": "left"
  }
}));

const AboutTechnology = props => {
  const classes = useStyles();

  return (
    <div className={classes.page}>
      <Helmet>
        <title>mic-check.ai - Technology</title>
      </Helmet>
      <Paper className={classes.paper}>
        <Typography
          variant="h2"
          style={{ textAlign: "center", color: "#0091ea" }}
        >
          mic-check.ai
        </Typography>
        <Typography
          variant="h6"
          style={{ textAlign: "center", color: "#607d8b" }}
          gutterBottom
        >
          Technical Overview
        </Typography>
        <div className={classes.body}>
          <Typography variant="h5" align="left" gutterBottom>
            Architecture
          </Typography>
          <Typography align="left">
            ### Backend AWS
            <br />* S3 hosts data, models, and scripts
            <br />* EC2 hosts crontab scheduled jobs, dev and prod graph
            databases in Neo4j Neo4j
            <br />* Graph database summary statistics for dev and prod databases
            <br />* Graph schema
          </Typography>
          <Typography align="left">
            ### Frontend Google Firebase <br />* Overview of Firebase services
            React.js
            <br />* Overview of front end architecture
          </Typography>
          <br />
          <Typography variant="h5" align="left" gutterBottom>
            Data
          </Typography>
          <Typography align="left">
            tweets/
            <br />* Twitter Search API
            <br />* Array json concatenated by day and grouped by topic
            parameter
            <br />
            user_timelines/
            <br />* Twitter User Timeline API
            <br />* Array json pulled for each user that is identified in
            network analysis as module center
          </Typography>
          <br />
          <Typography variant="h5" align="left" gutterBottom>
            Models
          </Typography>
          <Typography align="left">
            ### Network Models topic_persona.txt
            <br />* Str representation of list of user id's that were identified
            as module centers for each persona community analysis
            <br />* __leaders__ are users who have overall highest retweet and
            mention counts
            <br />* __content creators__ are users who have highest output of
            non-retweet (original tweets) content
            <br />* __amplifiers__ are users who have highest output of retweet
            content
            <br />* __watchdogs__ are users who have the highest output of
            mentions at other users topic_communities.gml
            <br />* Graph Markup Language file capturing representation of
            community that producted above user centers for reproducability
            <br />
            ### Natural Language Processing Models Sentiment Analysis
            <br />* BernoulliNB.pkl and SVC.pkl
            <br />* Serialized Python object representations of trained models
            on Sentiment140 dataset
            <br />* w2v.model and word_features.pkl
            <br />* Serialized Python object representations of word embeddings
            generated from tokenized Sentiment140 dataset Search Term Clustering
            <br />* TODO: Save search term clutsering word2vec model somewhere
            <br />* Serialized Python object representation of word embeddings
            generated from Wikipedia page scrapes for target search terms
          </Typography>
          <br />
          <Typography variant="h5" align="left" gutterBottom>
            Scripts
          </Typography>
          <Typography align="left">
            ### Hourly _pull_new_tweets.py_
            <br />* Hits Twitter Search API once per search term (24 total
            search terms) and appends tweets to json in `data/tweets/`
            <br />
            ### Daily _load_new_tweets.py_
            <br />* Unwinds Tweet JSONs from `data/tweets/` and merges
            `(User)-[TWEETED|RETWEETED]-(Tweet)-[MENTIONS]-(User)` graph
            relations into Neo4j development database using Python driver API
            <br />
            ### Weekly _train_models.py_
            <br />* For each defined user persona, exports a subgraph of the
            development database and runs it through InfoMap algorithm to
            identify communities and their centers
            <br />* __leader__: `MATCH
            (a:User)-[:TWEETED|:RETWEETED]->(t:Tweet)-[:TWEETED|:MENTIONS]-(b:User)`
            * __content creator__: `MATCH
            (a:User)-[:TWEETED]->(t:Tweet)-[:RETWEETED|:MENTIONS]-(b:User)`
            <br />* __amplifier__:
            `(a:User)-[:RETWEETED]->(t:Tweet)-[:TWEETED|:MENTIONS]-(b:User)`
            <br />* __watchdog__: `MATCH
            (a:User)-[:TWEETED]->(t:Tweet)-[:MENTIONS]->(b:User)`
            <br />* InfoMap
            <br />* Encode community partitions as Huffman coding prefixes and
            optimize the number of modules where the prefix to module codes are
            balanced
            <br />* Pls explain
            <br />* Random walker through network via Markov transition matrix
            <br />* There exist some "regions" within a network where a random
            walker is more likely to stay in and movement between these regions
            is relatively rare
            <br />* Map a prefix code to a region so we can re-use node level
            codewords for each node within a region
            <br />* City-street analogy: there are multiple "Main Streets" in
            the US but it's ok because you look up "Main Street, Oakland" or
            "Main Street, Los Angeles"
            <br />* Optimization
            <br />* Too few modules means that we're basically using regular
            low-level code words
            <br />* Too many modules means that we're using too many prefix
            codes
            <br />* Pick number of modules where we can compress our random
            walker with the minimum amount of information (prefix:node codes)
            <br />* We can't brute force search modules because it grows
            expoenentially with the number of nodes
            <br />* InfoMap uses Louvain's Method to approximate community
            partitions and then adjusts for information compression
            <br />* Louvain's Method detects communities by maximizing a
            modularity score for each community defined by how densely connected
            a group of nodes are compared to a random network
            <br />* We pass in (user_a, user_b, edge_weight) into InfoMap
            <br />* edge_weight is defined as the sum of the standardized
            follower and friend counts for a subset of users within the subgraph
            <br />* Once communities are defined, all community members are
            sorted according to a different ruleset depending on the persona
            we're looking for
            <br />* __leader__: max in-degrees
            <br />* __content creator__: max out-degrees
            <br />* __amplifier__: max out-degrees
            <br />* __watchdog__: max out-degrees
            <br />* These communities are written as .gml files to
            `data/models/` and the persona user ids are written as .txt files to
            `data/models/` <br />
            _pull_user_timelines.py_
            <br />* Hits Twitter User Timeline API once for each
            `topic_persona.txt` file and iterates through a list of user ids to
            pull Twitter Timeline histories, saving them as JSON arrays to
            `data/user_timelines/`
            <br />* Maximum user timeline limit is set to an estimated user
            average of three tweets per day for a three year recency window
            <br />* `ESTIMATED_USER_AVERAGE = 3 * 365 * 3 = 3285`
            _generate_user_profiles.py_
            <br />* Compares most recent network analysis results with user
            nodes already existing in production database and begins process for
            new users
            <br />* Can specify full rebuild, which tears down the production
            database and loads in entire network analysis results
            <br />* In practice, we have to limit the number of users we load in
            because _pull_user_timelines.py_ is bottlenecked by rate limits
            <br />* Builds a user profile for each user by generating the
            following summary statistics
            <br />* `topical_volume`: the percentage of a user's tweet history
            that is related to the specified search topic
            <br />* `positive_sentiment` and `negative_sentiment`: the
            percentage of a user's tweets relevant to the search term that are
            positive and negative, summing to 1 * `topical_retweets`: the
            percentage of a user's tweets that are retweeted by more than a
            threshhold of users
            <br />* Currently set to 1000
            <br />* Merges user profiles and the top K popular topical tweets
            for a user into production database * K currently set to 3
          </Typography>
        </div>
      </Paper>
    </div>
  );
};

export default AboutTechnology;
