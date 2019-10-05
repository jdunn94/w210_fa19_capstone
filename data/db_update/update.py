from neo4j import GraphDatabase
import time

uri = "bolt://localhost:7687"
driver = GraphDatabase.driver(uri, auth=("neo4j", "mcai2019"))

update_script = ""
with open('./update.cypher') as f:
    update_script = f.read()

res = None
with driver.session() as session:
    res = session.run(update_script)
summary = res.summary().counters

print(f"Nodes created: {summary.nodes_created}")
print(f"Relationships created: {summary.relationships_created}")

print("Sleeping...")
time.sleep(15)

with driver.session() as session:
    res = session.run(update_script)
summary = res.summary().counters

print(f"Nodes created: {summary.nodes_created}")
print(f"Relationships created: {summary.relationships_created}")

print("Sleeping...")
time.sleep(15)

with driver.session() as session:
    res = session.run(update_script)
summary = res.summary().counters

print(f"Nodes created: {summary.nodes_created}")
print(f"Relationships created: {summary.relationships_created}")
