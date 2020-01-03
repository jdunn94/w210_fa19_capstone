MATCH (a:User)-[:TWEETED|:RETWEETED]->(t:Tweet)-[:TWEETED|:MENTIONS]-(b:User)
RETURN toInteger(a.id), toInteger(a.followers_count), toInteger(a.friend_count),
       toInteger(b.id)
LIMIT 10000000