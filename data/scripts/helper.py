from neo4j import GraphDatabase
import os


def run_script(driver, script_path, args=None):
    script = ""
    with open(os.path.join(script_path)) as f:
        script = f.read()

    with driver.session() as session:
        res = session.run(script, args)
        summary = res.summary().counters

        print(script_path)
        print(f"Nodes created: {summary.nodes_created}")
        print(f"Relationships created: {summary.relationships_created}")
        print(f"Properties set: {summary.properties_set}")
