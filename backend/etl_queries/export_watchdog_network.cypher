MATCH (a:User)-[:TWEETED]->(t:Tweet)-[:MENTIONS]->(b:User)
MATCH (:Topic {name: {search_term}})-[:GENERATED]-(t)
RETURN toInteger(a.id), toInteger(a.followers_count), toInteger(a.friend_count),
       toInteger(b.id)