from datetime import date, timedelta
import json
import os

from neo4j import GraphDatabase

from datastorage import AWSWriter


# Constant
QUERIES = {
    "input_network": "MATCH (a:User)-[r1:TWEETED]->(t:Tweet)-[r2:MENTIONS]->(b:User) RETURN toInt(a.id),toInt(b.id)",
    "output_network": "MATCH (u:User {id: line[0]}) SET u.community = line[1], u.leader = line[2]",
    "input_sentiment": "MATCH (t:Tweet) RETURN DISTINCT t.id, t.text",
    "input_location": "MATCH (u:User)"
}

BATCH_SIZE = 10000
DEV_BOLT_URI = "bolt://mcai.dataerrant.com:7687"
ETL_QUERIES_PATH = "./etl_queries"
NEO_USERNAME = os.environ.get("NEO_USERNAME")
NEO_PASSWORD = os.environ.get("NEO_PASSWORD")
# TODO: Update PROD_BOLT_URI
PROD_BOLT_URI = ""
S3_PATH = "https://mcai.s3.us-east-2.amazonaws.com/data/"


class DatabaseManager:
    """Responsible for merging twitter json data into the development Neo4j database and for exporting
    data from dev DB to models"""
    def __init__(self):
        """Constructor for DatabaseManager class"""
        self.dev_driver = self.connect_database(DEV_BOLT_URI)
        #self.prod_driver = self.connect_database(PROD_BOLT_URI)
        self.batch_size = BATCH_SIZE
        self.aws_writer = AWSWriter()

    @staticmethod
    def run_script(driver, script_path, args=None):
        """Helper function to run cypher queries"""
        with open(os.path.join(script_path)) as f:
            script = f.read()

        with driver.session() as session:
            res = session.run(script, args)
            summary = res.summary().counters
            for uid in res:
                print(uid)

            print(script_path)
            print(f"Nodes created: {summary.nodes_created}")
            print(f"Relationships created: {summary.relationships_created}")
            print(f"Properties set: {summary.properties_set}")

    @staticmethod
    def connect_database(bolt_uri):
        """Spin up a neo4j driver"""
        dev_driver = GraphDatabase.driver(bolt_uri, auth=(NEO_USERNAME, NEO_PASSWORD))
        return dev_driver

    @staticmethod
    def format_date(dateobject):
        """Formats a dateobject into MM_DD_YYYY str"""
        return str(dateobject).replace("-", "_")

    def load_data_into_model(self, input_query):
        """Exposed function to execute a match query returning edge relationships"""
        with self.dev_driver.session() as session:
            results = session.run(QUERIES[input_query])
        return list(map(tuple, results))

    def merge_model_results(self, model_results, output_query):
        """Merge model results back into Neo4j development database"""
        chunks = (len(model_results) - 1) // self.batch_size + 1
        for i in range(chunks):
            batch = model_results[i*self.batch_size:(i+1) * self.batch_size]
            query = "UNWIND" + str(batch) + "AS line " + QUERIES[output_query]
            with self.dev_driver.session() as session:
                session.run(query)

    def _load_tweets_json(self, inpath, search_term):
        """Load json data into Neo4j development database"""
        # default is to load in the last 24 hours worth of json data
        today = self.format_date(date.today())
        yesterday = self.format_date(date.today() - timedelta(1))
        today_json = json.loads(self.aws_writer.read_object(inpath + today + ".json"))
        yesterday_json = json.loads(self.aws_writer.read_object(inpath + yesterday + ".json"))
        if today_json:
            self.run_script(self.dev_driver, os.path.join(ETL_QUERIES_PATH, "import_json.cypher"),
                            {"json": today_json, "json_file": today, "search_term": search_term})
        if yesterday_json:
            self.run_script(self.dev_driver, os.path.join(ETL_QUERIES_PATH, "import_json.cypher"),
                            {"json": yesterday_json, "json_file": yesterday, "search_term": search_term})

    def _load_user_timeline_json(self, inpath):
        """Load user timeline json data into Neo4j development database"""
        user_timeline = self.aws_writer.read_json(inpath)
        if user_timeline:
            user_timeline = json.loads(user_timeline)
            self.run_script(self.dev_driver, os.path.join(ETL_QUERIES_PATH, "import_user_timeline_json.cypher"),
                            {"json": user_timeline, "json_file": "user_timeline"})

    def load_new_tweets(self, search_term):
        """Exposed function to load in new tweets by search term into the development database"""
        inpath = "data/tweets" + search_term + "_tweets_"
        self._load_tweets_json(inpath, search_term)

    def load_new_user_timeline(self, inpath):
        """Exposed function to load in user timelines with a given user_id"""
        self._load_user_timeline_json(inpath)

    def migrate_dev_to_prod(self):
        """Migrates the dev database to production"""
        pass
