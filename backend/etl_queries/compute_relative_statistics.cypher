MATCH (u:User)-[r:TWEETS_ABOUT]->(top:Topic {name: {search_term}}) WHERE r.topical_volume > 0
SET r.relative_volume = r.topical_volume / top.average_topical_volume,
  r.relative_positive_sentiment = r.positive_sentiment / top.average_positive_sentiment,
  r.relative_negative_sentiment = r.negative_sentiment / top.negative_sentiment,
  r.relative_retweets = r.topical_retweets / top.average_topical_retweets