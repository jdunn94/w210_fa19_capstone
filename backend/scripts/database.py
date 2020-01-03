from datetime import date, timedelta
import json
import os
import re

from neo4j import GraphDatabase

from datastorage import AWSWriter


# Constant
QUERIES = {
    "input_network": "MATCH (a:User)-[r1:TWEETED]->(t:Tweet)-[r2:MENTIONS]->(b:User) RETURN toInt(a.id),toInt(b.id)",
    "output_network": "MATCH (u:User {id: line[0]}) SET u.community = line[1], u.persona = line[2]",
    "input_sentiment": "MATCH (t:Tweet) RETURN DISTINCT t.id, t.text",
    "input_location": "MATCH (u:User)",
    "output_user_profile": "MERGE (u:User {id: line[0]}) SET u.topical_volume = line[1], u.topical_sentiment = line["
                           "2], u.topical_retweets = line[3]"
}

BATCH_SIZE = 10000
DEV_BOLT_URI = "bolt://mcai.dataerrant.com:7687"
ETL_QUERIES_PATH = "./etl_queries"
NEO_USERNAME = os.environ.get("NEO_USERNAME")
NEO_PASSWORD = os.environ.get("NEO_PASSWORD")
# TODO: Update PROD_BOLT_URI
PROD_BOLT_URI = "bolt://mcai2.dataerrant.com:7687"
S3_PATH = "https://mcai.s3.us-east-2.amazonaws.com/data/"
TWEET_FILEPATH = "data/tweets/"


class DatabaseManager:
    """Responsible for merging twitter json data into the development Neo4j database and for exporting
    data from dev DB to models"""
    def __init__(self, dev_bolt_uri=DEV_BOLT_URI, prod_bolt_uri=PROD_BOLT_URI):
        """Constructor for DatabaseManager class"""
        self.dev_driver = self.connect_database(dev_bolt_uri)
        self.prod_driver = self.connect_database(prod_bolt_uri)
        self.batch_size = BATCH_SIZE
        self.aws_writer = AWSWriter()

    @staticmethod
    def run_script(driver, script_path, args=None, verbose=False, get_values=False):
        """Helper function to run cypher queries"""
        with open(os.path.join(script_path)) as f:
            script = f.read()

        with driver.session() as session:
            res = session.run(script, args)
            if verbose:
                summary = res.summary().counters
                print(script_path)
                print(f"Nodes created: {summary.nodes_created}")
                print(f"Relationships created: {summary.relationships_created}")
                print(f"Properties set: {summary.properties_set}")
            if get_values:
                return res

    @staticmethod
    def connect_database(bolt_uri):
        """Spin up a neo4j driver"""
        dev_driver = GraphDatabase.driver(bolt_uri, auth=(NEO_USERNAME, NEO_PASSWORD))
        return dev_driver

    @staticmethod
    def format_date(dateobject):
        """Formats a dateobject into MM_DD_YYYY str"""
        return str(dateobject).replace("-", "_")

    def destroy_production_database(self):
        """Remove all nodes and relationships in production database to prepare for rebuild"""
        deleted_nodes = -1
        while deleted_nodes != 0:
            results = self.run_script(self.prod_driver, os.path.join(ETL_QUERIES_PATH, "destroy_database.cypher"),
                            verbose=True, get_values=True)
            deleted_nodes = [x[0] for x in results][0]

    def load_data_into_model(self, topic, persona_query, full_graph=False):
        """Exposed function to execute a match query returning edge relationships"""
        args = {"search_term": topic}
        if full_graph:
            results = self.run_script(self.dev_driver, os.path.join(ETL_QUERIES_PATH, "export_full_network.cypher"),
                                      args=args, verbose=True, get_values=True)
        else:
            results = self.run_script(self.dev_driver, os.path.join(ETL_QUERIES_PATH, persona_query),
                                  args=args, verbose=True, get_values=True)
        return list(map(tuple, results))

    def merge_model_results(self, model_results, output_query):
        """Merge model results back into Neo4j development database"""
        chunks = (len(model_results) - 1) // self.batch_size + 1
        for i in range(chunks):
            batch = model_results[i*self.batch_size:(i+1) * self.batch_size]
            query = "UNWIND" + str(batch) + "AS line " + QUERIES[output_query]
            with self.dev_driver.session() as session:
                session.run(query)

    def _write_user_properties(self, user_properties):
        """Write user profile properties to Neo4j as (:User) SET properties"""
        args = {"properties": user_properties}
        self.run_script(self.prod_driver, os.path.join(ETL_QUERIES_PATH, "import_individual_properties.cypher"),
                        args=args, verbose=True)

    @staticmethod
    def _extract_tweet_properties(tweet, topic):
        """Extract tweet properties from a tweet json and return as a nested list"""
        tweet_properties = dict()
        property_names = ["id", "retweet_count", "favorite_count", "full_text", "created_at"]
        for name in property_names:
            tweet_properties[name] = tweet[name]
        tweet_properties["user"] = tweet["user"]["id"]
        tweet_properties["topic"] = topic
        return tweet_properties

    def _write_popular_tweets(self, popular_tweets, topic):
        """Write popular tweets to Neo4j as (:User)-[:Tweeted]-(:Tweet)"""
        for tweet in popular_tweets:
            tweet_properties = self._extract_tweet_properties(tweet, topic)
            args = {"properties": tweet_properties}
            self.run_script(self.prod_driver, os.path.join(ETL_QUERIES_PATH, "import_popular_tweets.cypher"),
                            args=args, verbose=True)

    def _write_common_hashtags(self, user, common_hashtags, topic):
        """Write common hashtags as (:User)-[:COMMON_HASHTAG]-(:Hashtag)"""
        for hashtag, count in common_hashtags:
            args = {"properties": {"name": hashtag, "count": count, "user": user, "topic": topic}}
            self.run_script(self.prod_driver, os.path.join(ETL_QUERIES_PATH, "import_common_hashtags.cypher"),
                            args=args, verbose=True)

    def merge_user_profile(self, user_properties, popular_tweets, common_hashtags, topic):
        """Merge user profile properties as User and Tweet nodes into prod database"""
        self._write_user_properties(user_properties)
        self._write_popular_tweets(popular_tweets, topic)
        self._write_common_hashtags(user_properties["user"], common_hashtags, topic)

    def _load_tweets_json(self, inpath, search_term, recent=True):
        """Load json data into Neo4j development database"""
        if recent:
            # default is to load in the last 24 hours worth of json data
            today = self.format_date(date.today())
            yesterday = self.format_date(date.today() - timedelta(1))
            today_json = self.aws_writer.read_json(inpath + today + ".json")
            yesterday_json = self.aws_writer.read_json(inpath + yesterday + ".json")
            if today_json:
                data = json.loads(today_json)
                self.run_script(self.dev_driver, os.path.join(ETL_QUERIES_PATH, "import_search_api_json.cypher"),
                                args={"json": data, "json_file": today, "search_term": search_term}, verbose=True)
            if yesterday_json:
                data = json.loads(yesterday_json)
                self.run_script(self.dev_driver, os.path.join(ETL_QUERIES_PATH, "import_search_api_json.cypher"),
                                args={"json": data, "json_file": yesterday, "search_term": search_term}, verbose=True)
        else:
            # pull the entire tweet datastorage for a topic and load them all in
            tweet_filenames = self.aws_writer.get_all_filenames(TWEET_FILEPATH + search_term)
            for filename in tweet_filenames:
                data = json.loads(self.aws_writer.read_json(filename))
                filedate = re.search(r'\d{4}_\d{2}_\d{2}', filename).group()
                self.run_script(self.dev_driver, os.path.join(ETL_QUERIES_PATH, "import_search_api_json.cypher"),
                                args={"json": data, "json_file": filedate, "search_term": search_term}, verbose=True)


    def load_new_tweets(self, search_term, recent=True):
        """Exposed function to load in new tweets by search term into the development database"""
        inpath = "data/tweets/" + search_term + "_tweets_"
        self._load_tweets_json(inpath, search_term, recent)

    def load_nosentiment_tweets(self):
        """Exposed function to load in all tweets that do not have sentiment labels"""
        results = self.run_script(self.dev_driver, os.path.join(ETL_QUERIES_PATH, "export_nosentiment_tweets.cypher"),
                                  get_values=True)
        return [record for record in results.values()]

    def load_production_tweets(self):
        """Exposed function to load in all tweets that do not have sentiment labels"""
        results = self.run_script(self.prod_driver, os.path.join(ETL_QUERIES_PATH, "export_production_tweets.cypher"),
                                  get_values=True)
        return [record for record in results.values()]

    def migrate_dev_to_prod(self, export_users):
        """Migrates the dev database to production"""
        # pull user nodes from dev database
        export_args = {"users_to_migrate": export_users}
        results = self.run_script(self.dev_driver, os.path.join(ETL_QUERIES_PATH,
                                                                "export_migration_users_and_topics.cypher"),
                                  args=export_args, get_values=True)
        import_users = [({k: v for k, v in x['u']._properties.items()}, x['t.name']) for x in results.data()]
        [x[0].update({"topic_name": x[1]}) for x in import_users]
        import_users = [x[0] for x in import_users]
        # write user nodes to prod database
        import_args = {"users_to_migrate": import_users}
        self.run_script(self.prod_driver, os.path.join(ETL_QUERIES_PATH, "import_migration_users_and_topics.cypher"),
                        args=import_args, verbose=True)

    def ensure_topic_node(self, topic):
        """Merges the topic node into the production database"""
        args = {"topic": topic}
        self.run_script(self.prod_driver, os.path.join(ETL_QUERIES_PATH, "import_topic_node.cypher"),
                        args=args, verbose=True)
