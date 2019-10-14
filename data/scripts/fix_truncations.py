from neo4j import GraphDatabase
import time
import os
from helper import run_script

ETL_QUERIES_PATH = "../etl_queries"

uri = "bolt://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "mcai2019"))

for i in range (0,100000):
	requests = 0
	start = time.time()
	elapsed = 0
	while requests <= 200 and elapsed < 900:
		run_script(driver, os.path.join(ETL_QUERIES_PATH, 'more_tweet_info.cypher'))
		requests += 1
		elapsed = time.time() - start
	if requests > 200 and elapsed < 900:
		time.sleep(round(900 - elapsed))
	
driver.close()
