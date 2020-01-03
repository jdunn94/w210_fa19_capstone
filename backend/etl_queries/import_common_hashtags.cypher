WITH {properties} AS hashtagUpdate
MATCH (u:User {id: hashtagUpdate.user})
MERGE (h:Hashtag {name: hashtagUpdate.name})
  ON MATCH SET h.topical_count = hashtagUpdate.count
  ON CREATE SET h.name = hashtagUpdate.name, h.topical_count = hashtagUpdate.count
MERGE (u)-[:COMMON_HASHTAG]->(h)
WITH hashtagUpdate, h
MATCH (top:Topic {name: hashtagUpdate.topic})
MERGE (top)-[:GENERATED]->(h)