MERGE (topic:Topic {name: {search_term}})

WITH {json} as data
UNWIND data as entry
UNWIND entry.items as status
WITH CASE WHEN (status.retweeted_status is not null) then [status.retweeted_status] else [] end as retweet_array, CASE WHEN (status.retweeted_status is null) then [status] else [] end as tweet_array, status.user as userData, status.id as id, status.created_at as created_at, CASE WHEN (status.in_reply_to_status_id is not null) THEN ['ok'] ELSE [] END as reply_array, CASE WHEN (status.quoted_status.in_reply_to_status_id is not null) THEN ['ok'] ELSE [] END as quote_reply_array, CASE WHEN (status.retweeted_status.in_reply_to_status_id is not null) THEN ['ok'] ELSE [] END as retweet_reply_array, CASE WHEN (status.retweeted_status.quoted_status.in_reply_to_status_id is not null) THEN ['ok'] ELSE [] END as retweet_quoted_reply_array

MERGE (user:User {id: userData.id})
ON CREATE SET user.id=userData.id, user.friend_count= userData.friends_count, user.favourites_count=userData.favourites_count, user.description=userData.description, user.screen_name = userData.screen_name, user.followers_count=userData.followers_count, user.location=userData.location, user.name = userData.name, user.created = userData.created_at
ON MATCH SET user.screen_name = userData.screen_name, user.friend_count= userData.friends_count, user.favourites_count=userData.favourites_count, user.description=userData.description, user.followers_count=userData.followers_count, user.location=userData.location, user.name=userData.name, user.created = userData.created_at

FOREACH(tweet in tweet_array |
	MERGE (t:Tweet {id: tweet.id})
	ON CREATE SET t.id = tweet.id, t.text = tweet.full_text, t.urls = [u IN tweet.entities.urls | u.expanded_url], t.favorite_count = tweet.favorite_count, t.retweet_count = tweet.retweet_count, t.coordinates = tweet.coordinates.coordinates, t.place = tweet.place.full_name, t.created_at = tweet.created_at, t.truncated = tweet.truncated, t.json_file={json_file}
	ON MATCH SET t.text = tweet.full_text, t.urls = [u IN tweet.entities.urls | u.expanded_url], t.favorite_count = tweet.favorite_count, t.retweet_count = tweet.retweet_count, t.coordinates = tweet.coordinates.coordinates, t.place = tweet.place.full_name, t.created_at = tweet.created_at, t.truncated = tweet.truncated, t.json_file={json_file}

	MERGE (user)-[:TWEETED]->(t)
	MERGE (topic)-[:GENERATED]->(t)

	FOREACH(hashtag in tweet.entities.hashtags |
		MERGE (tag:Hashtag {name: hashtag.text})
		ON CREATE SET tag.name=hashtag.text
		MERGE (t)-[:TAGGED]->(tag)
	)

	FOREACH(mention in tweet.entities.user_mentions |
		MERGE (u2:User {id: mention.id})
		ON CREATE SET u2.screen_name=mention.screen_name, u2.id=mention.id, u2.name=mention.name
		MERGE (t)-[:MENTIONS]->(u2)
	)

	FOREACH(reply in reply_array |
		MERGE (reply_tweet:Tweet {id: tweet.in_reply_to_status_id})
		MERGE (t)-[:REPLY_TO]->(reply_tweet)

		MERGE (reply_user:User {id: tweet.in_reply_to_user_id})
		ON CREATE SET reply_user.screen_name = tweet.in_reply_to_screen_name, reply_user.id = tweet.status.in_reply_to_user_id
		MERGE (reply_user)-[:TWEETED]->(reply_tweet)
	)

	FOREACH(quote in CASE WHEN (tweet.quoted_status is not null) THEN [tweet.quoted_status] ELSE [] end |
		MERGE (qt:Tweet {id: quote.id})
		ON CREATE SET qt.id = quote.id, qt.text = quote.full_text, qt.urls = quote.urls, qt.favorite_count = quote.favorite_count, qt.retweet_count = quote.retweet_count, qt.coordinates = quote.coordinates.coordinates, qt.place = quote.place.full_name, qt.truncated = quote.truncated
		ON MATCH SET qt.text = quote.full_text, qt.urls = quote.urls, qt.favorite_count = quote.favorite_count, qt.retweet_count = quote.retweet_count, qt.coordinates = quote.coordinates.coordinates, qt.place = quote.place.full_name, qt.truncated = quote.truncated

		FOREACH(hashtag in qt.entities.hashtags |
			MERGE (tag:Hashtag {name: hashtag.text})
			ON CREATE SET tag.name=hashtag.text
			MERGE (qt)-[:TAGGED]->(tag)
		)

		FOREACH(mention in qt.entities.user_mentions |
			MERGE (u2:User {id: mention.id})
			ON CREATE SET u2.screen_name=mention.screen_name, u2.id=mention.id, u2.name=mention.name
			MERGE (qt)-[:MENTIONS]->(u2)
		)

		MERGE (qtu:User {id: quote.user.id})
		ON CREATE SET qtu.id=quote.user.id, qtu.friend_count= quote.user.friends_count, qtu.favourites_count=quote.user.favourites_count, qtu.description=quote.user.description, qtu.screen_name = quote.user.screen_name, qtu.followers_count=quote.user.followers_count, qtu.location=quote.user.location, qtu.name = quote.user.name, qtu.created = quote.user.created_at
		ON MATCH SET qtu.screen_name = quote.user.screen_name, qtu.friend_count= quote.user.friends_count, qtu.favourites_count=quote.user.favourites_count, qtu.description=quote.user.description, qtu.followers_count=quote.user.followers_count, qtu.location=quote.user.location, qtu.name = quote.user.name, qtu.created = quote.user.created_at
		MERGE (qtu)-[:TWEETED]->(qt)


		FOREACH(reply in quote_reply_array |
			MERGE (reply_tweet:Tweet {id: quote.in_reply_to_status_id})
			MERGE (qt)-[:REPLY_TO]->(reply_tweet)

			MERGE (reply_user:User {id: quote.in_reply_to_user_id})
			ON CREATE SET reply_user.screen_name = quote.in_reply_to_screen_name, reply_user.id = quote.status.in_reply_to_user_id
			MERGE (reply_user)-[:TWEETED]->(reply_tweet)
		)

		MERGE (t)-[:QUOTES]->(qt)
	)
)

FOREACH(retweet in retweet_array |
	MERGE (rt:Tweet {id: retweet.id})
	ON CREATE SET rt.id = retweet.id, rt.text = retweet.full_text, rt.urls = retweet.urls, rt.favorite_count = retweet.favorite_count, rt.retweet_count = retweet.retweet_count, rt.coordinates = retweet.coordinates.coordinates, rt.place = retweet.place.full_name, rt.truncated = retweet.truncated, rt.json_file={json_file}
	ON MATCH SET rt.full_text = retweet.text, rt.urls = retweet.urls, rt.favorite_count = retweet.favorite_count, rt.retweet_count = retweet.retweet_count, rt.coordinates = retweet.coordinates.coordinates, rt.place = retweet.place.full_name, rt.truncated = retweet.truncated, rt.json_file={json_file}

	FOREACH(hashtag in retweet.entities.hashtags |
		MERGE (tag:Hashtag {name: hashtag.text})
		ON CREATE SET tag.name=hashtag.text
		MERGE (rt)-[:TAGGED]->(tag)
	)

	FOREACH(mention in retweet.entities.user_mentions |
		MERGE (u2:User {id: mention.id})
		ON CREATE SET u2.screen_name=mention.screen_name, u2.id=mention.id, u2.name=mention.name
		MERGE (rt)-[:MENTIONS]->(u2)
	)

	MERGE (rtu:User {id: retweet.user.id})
	ON CREATE SET rtu.id=retweet.user.id, rtu.friend_count= retweet.user.friends_count, rtu.favourites_count=retweet.user.favourites_count, rtu.description=retweet.user.description, rtu.screen_name = retweet.user.screen_name, rtu.followers_count=retweet.user.followers_count, rtu.location=retweet.user.location, rtu.name = retweet.user.name, rtu.created = retweet.user.created_at
	ON MATCH SET rtu.screen_name=retweet.user.screen_name, rtu.friend_count= retweet.user.friends_count, rtu.favourites_count=retweet.user.favourites_count, rtu.description=retweet.user.description, rtu.followers_count=retweet.user.followers_count, rtu.location=retweet.user.location, rtu.name = retweet.user.name, rtu.created = retweet.user.created_at
	MERGE (rtu)-[:TWEETED]->(rt)

	FOREACH(reply in retweet_reply_array |
		MERGE (reply_tweet:Tweet {id: retweet.in_reply_to_status_id})
		MERGE (rt)-[:REPLY_TO]->(reply_tweet)

		MERGE (reply_user:User {id: retweet.in_reply_to_user_id})
		ON CREATE SET reply_user.screen_name = retweet.in_reply_to_screen_name, reply_user.id = retweet.status.in_reply_to_user_id
		MERGE (reply_user)-[:TWEETED]->(reply_tweet)
	)

	FOREACH(quote in CASE WHEN (retweet.quoted_status is not null) THEN [retweet.quoted_status] ELSE [] end |
		MERGE (qt:Tweet {id: quote.id})
		ON CREATE SET qt.id = quote.id, qt.text = quote.full_text, qt.urls = quote.urls, qt.favorite_count = quote.favorite_count, qt.retweet_count = quote.retweet_count, qt.coordinates = quote.coordinates.coordinates, qt.place = quote.place.full_name, qt.truncated = quote.truncated
		ON MATCH SET qt.text = quote.full_text, qt.urls = quote.urls, qt.favorite_count = quote.favorite_count, qt.retweet_count = quote.retweet_count, qt.coordinates = quote.coordinates.coordinates, qt.place = quote.place.full_name, qt.truncated = quote.truncated

		FOREACH(hashtag in qt.entities.hashtags |
			MERGE (tag:Hashtag {name: hashtag.text})
			ON CREATE SET tag.name=hashtag.text
			MERGE (qt)-[:TAGGED]->(tag)
		)

		FOREACH(mention in qt.entities.user_mentions |
			MERGE (u2:User {id: mention.id})
			ON CREATE SET u2.screen_name=mention.screen_name, u2.id=mention.id, u2.name=mention.name
			MERGE (qt)-[:MENTIONS]->(u2)
		)

		MERGE (qtu:User {id: quote.user.id})
		ON CREATE SET qtu.id=quote.user.id, qtu.friend_count= quote.user.friends_count, qtu.favourites_count=quote.user.favourites_count, qtu.description=quote.user.description, qtu.screen_name = quote.user.screen_name, qtu.followers_count=quote.user.followers_count, qtu.location=quote.user.location, qtu.name = quote.user.name, qtu.created = quote.user.created_at
		ON MATCH SET qtu.screen_name = quote.user.screen_name, qtu.friend_count= quote.user.friends_count, qtu.favourites_count=quote.user.favourites_count, qtu.description=quote.user.description, qtu.followers_count=quote.user.followers_count, qtu.location=quote.user.location, qtu.name = quote.user.name, qtu.created = quote.user.created_at
		MERGE (qtu)-[:TWEETED]->(qt)

		FOREACH(reply in retweet_quoted_reply_array |
			MERGE (reply_tweet:Tweet {id: quote.in_reply_to_status_id})
			MERGE (qt)-[:REPLY_TO]->(reply_tweet)

			MERGE (reply_user:User {id: quote.in_reply_to_user_id})
			ON CREATE SET reply_user.screen_name = quote.in_reply_to_screen_name, reply_user.id = quote.status.in_reply_to_user_id
			MERGE (reply_user)-[:TWEETED]->(reply_tweet)
		)

		MERGE (rt)-[:QUOTES]->(qt)
	)

	MERGE  (user)-[:RETWEETED {retweet_id:id, retweet_created_at: created_at}]->(rt)

)