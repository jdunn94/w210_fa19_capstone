MATCH path=(u:User)-[r:TWEETS_ABOUT]->(top:Topic)
  WHERE NOT (u)-[:POPULAR_TWEETED]->(:Tweet)<-[:GENERATED]-(top)
DELETE r