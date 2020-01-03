MATCH (u:User)-[:TWEETS_ABOUT]->(:Topic {name: {search_term}})
RETURN u.id, u.topical_volume, u.positive_sentiment, u.negative_sentiment