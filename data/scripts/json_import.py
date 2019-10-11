from neo4j import GraphDatabase
import os
from helper import run_script

JSON_PATH = "/graph_data/data/json_results"
ETL_QUERIES_PATH = "../etl_queries"
MAX_IMPORTS = 100

uri = "bolt://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "mcai2019"))

# get last json import file number
complete_json = 0
with driver.session() as session:
    res = session.run(
        "match (n:Tweet) return CASE WHEN max(n.json_file) IS NULL THEN 0 ELSE max(n.json_file) END as complete_json")
    complete_json = res.values()[0][0]

print(f"Last json file imported: {complete_json}")

# get list of all available json files
files = [(x,int(
    x.split("data")[1].split(".")[0])) for x in os.listdir(JSON_PATH) if int(
    x.split("data")[1].split(".")[0]) > complete_json]
# need to sort so that we start at the earliest also for the complete_json flag
files = sorted(files, key=lambda x: x[1])
print(f"Found {len(files)} files needing import")
for file in files[:MAX_IMPORTS]:
    file_path = os.path.join(JSON_PATH, file[0])
    run_script(driver, os.path.join(ETL_QUERIES_PATH,
                                    'import_json.cypher'), {'url':"file:///" + file_path,'json_file':file[1]})
    print(f"Completed import: {file_path}")

run_script(driver, os.path.join(ETL_QUERIES_PATH, 'more_tweet_info.cypher'))
try:
    run_script(driver, os.path.join(ETL_QUERIES_PATH, 'more_user_info.cypher'))
except:
    print(f"More user info failed")

run_script(driver, os.path.join(
ETL_QUERIES_PATH, 'add_tweet_text_lower.cypher'))



driver.close()
