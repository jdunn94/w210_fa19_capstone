MATCH (currentTweet:Tweet)
WITH max(currentTweet.id) as max_id
CALL apoc.static.getAll("twitter") yield value AS twitter
CALL apoc.load.jsonParams(twitter.url + "homeless&since_id="+max_id,{Authorization:"Bearer "+twitter.bearer},null) yield value
UNWIND value.statuses as status
WITH status, status.user as u, status.entities as e
WITH  status, status.retweeted_status as retweet, u as userData, [t IN e.hashtags | t.text] as tags, [m IN e.user_mentions | m.screen_name] as mentions, [u IN e.urls | u.expanded_url] as urls

MERGE (t:Tweet {id: status.id})
ON CREATE SET t.id = status.id, t.text = status.text, t.urls = urls, t.favorite_count = status.favorite_count, t.retweet_count = status.retweet_count, t.geo = status.geo, t.coordinates = status.coordinates, t.place = status.place.full_name, t.created_at = status.created_at
ON MATCH SET t.text = status.text, t.urls = urls, t.favorite_count = status.favorite_count, t.retweet_count = status.retweet_count, t.geo = status.geo, t.coordinates = status.coordinates, t.place = status.place.full_name, t.created_at = status.created_at

MERGE (user:User {screen_name: userData.screen_name})
ON CREATE SET user.id=userData.id, user.friend_count= userData.friends_count, user.favourites_count=userData.favourites_count, user.description=userData.description, user.screen_name = userData.screen_name, user.followers_count=userData.followers_count, user.location=userData.location, user.name = userData.name, user.created = userData.created_at
ON MATCH SET user.id=userData.id, user.friend_count= userData.friends_count, user.favourites_count=userData.favourites_count, user.description=userData.description, user.followers_count=userData.followers_count, user.location=userData.location, user.name=userData.name, user.created = userData.created_at

MERGE (user)-[r1:TWEETED]->(t)

FOREACH(hashtag in tags | 
  MERGE (tag:Hashtag {name: hashtag})
  ON CREATE SET tag.name=hashtag
  MERGE (t)-[r3:TAGGED]->(tag)
)

FOREACH(mention in mentions | 
	MERGE (u2:User {screen_name: mention})
    ON CREATE SET u2.screen_name=mention
	MERGE (t)-[r2:MENTIONS]->(u2)
)

WITH t, retweet, status, CASE WHEN (status.in_reply_to_status_id is not null) THEN ['ok'] ELSE [] END as reply_array, CASE WHEN (retweet is not null) THEN ['ok'] ELSE [] END as retweet_array
FOREACH(reply in reply_array | 
	MERGE (reply_tweet:Tweet {id: status.in_reply_to_status_id})
    MERGE (t)-[:REPLY_TO]->(reply_tweet)

    MERGE (reply_user:User {screen_name: status.in_reply_to_screen_name})
    ON CREATE SET reply_user.screen_name = status.in_reply_to_screen_name, reply_user.id = status.status.in_reply_to_user_id
    ON MATCH SET reply_user.id = status.status.in_reply_to_user_id
    MERGE (reply_user)-[:TWEETED]->(reply_tweet)
)
FOREACH(retweet_item in retweet_array | 
    MERGE (rt:Tweet {id: retweet.id})
    ON CREATE SET rt.id = retweet.id, rt.text = retweet.text, rt.urls = retweet.urls, rt.favorite_count = retweet.favorite_count, rt.retweet_count = retweet.retweet_count, rt.geo = retweet.geo, rt.coordinates = retweet.coordinates, rt.place = retweet.place.full_name
    ON MATCH SET rt.text = retweet.text, rt.urls = retweet.urls, rt.favorite_count = retweet.favorite_count, rt.retweet_count = retweet.retweet_count, rt.geo = retweet.geo, rt.coordinates = retweet.coordinates, rt.place = retweet.place.full_name
    MERGE (t)-[:RETWEETED]->(rt)

    MERGE (rtu:User {screen_name: retweet.user.screen_name})
    ON CREATE SET rtu.id=retweet.user.id, rtu.friend_count= retweet.user.friends_count, rtu.favourites_count=retweet.user.favourites_count, rtu.description=retweet.user.description, rtu.screen_name = retweet.user.screen_name, rtu.followers_count=retweet.user.followers_count, rtu.location=retweet.user.location, rtu.name = retweet.user.name, rtu.created = retweet.user.created_at
    ON MATCH SET rtu.id=retweet.user.id, rtu.friend_count= retweet.user.friends_count, rtu.favourites_count=retweet.user.favourites_count, rtu.description=retweet.user.description, rtu.followers_count=retweet.user.followers_count, rtu.location=retweet.user.location, rtu.name = retweet.user.name, rtu.created = retweet.user.created_at
    MERGE  (rtu)-[:TWEETED]->(rt)
)