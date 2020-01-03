WITH {properties} AS newTweet
MATCH (u:User {id: newTweet.user})
MERGE (t:Tweet {id: newTweet.id})
  ON MATCH SET t.retweet_count = newTweet.retweet_count, t.favorite_count = newTweet.favorite_count, t.text =
  newTweet.full_text
  ON CREATE SET t.created_at_date = newTweet.created_at, t.text = newTweet.full_text, t.retweet_count =
  newTweet.retweet_count, t.favorite_count = newTweet.favorite_count
MERGE (u)-[:POPULAR_TWEETED]->(t)
WITH newTweet, t
MATCH (top:Topic {name: newTweet.topic}) WITH top, newTweet, t
MERGE (top)-[:GENERATED]->(t)