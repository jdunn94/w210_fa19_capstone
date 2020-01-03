MATCH (u:User)-[:TWEETS_ABOUT]->(:Topic {name: {search_term}})
RETURN u.id