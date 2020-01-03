WITH {properties} as userUpdate
MATCH (u:User {id: userUpdate.user})-[r:TWEETS_ABOUT]->(top:Topic)
SET r.topical_volume = userUpdate.topical_volume, r.positive_sentiment = userUpdate.positive_sentiment,
r.negative_sentiment = userUpdate.negative_sentiment, r.topical_retweets = userUpdate.topical_retweets