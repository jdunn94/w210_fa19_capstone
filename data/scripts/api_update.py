from neo4j import GraphDatabase
import time
import os
from helper import run_script

ETL_QUERIES_PATH = "../etl_queries"

uri = "bolt://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "mcai2019"))

run_script(driver, os.path.join(ETL_QUERIES_PATH, 'update.cypher'))
run_script(driver, os.path.join(ETL_QUERIES_PATH, 'more_tweet_info.cypher'))
run_script(driver, os.path.join(ETL_QUERIES_PATH, 'more_user_info.cypher'))
run_script(driver, os.path.join(ETL_QUERIES_PATH, 'get_timeline_auto.cypher'))
run_script(driver, os.path.join(
    ETL_QUERIES_PATH, 'add_tweet_text_lower.cypher'))

print("Sleeping...")
time.sleep(15)

run_script(driver, os.path.join(ETL_QUERIES_PATH, 'update.cypher'))
run_script(driver, os.path.join(ETL_QUERIES_PATH, 'more_tweet_info.cypher'))
run_script(driver, os.path.join(ETL_QUERIES_PATH, 'more_user_info.cypher'))
run_script(driver, os.path.join(ETL_QUERIES_PATH, 'get_timeline_auto.cypher'))
run_script(driver, os.path.join(
    ETL_QUERIES_PATH, 'add_tweet_text_lower.cypher'))

driver.close()
