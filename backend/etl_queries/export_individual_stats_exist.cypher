MATCH (u:User)-[r:TWEETS_ABOUT]->(:Topic {name: {search_term}}) WHERE EXISTS(r.topical_volume)
RETURN r.positive_sentiment, r.negative_sentiment, r.topical_volume, r.topical_retweets