MATCH (stubUsers:User)
WHERE stubUsers.followers_count is null
WITH collect(stubUsers.id)[..100] as user_ids
WITH REDUCE(s = HEAD(user_ids), n IN TAIL(user_ids) | s + ',' + n) AS result
CALL apoc.static.getAll("twitter") yield value AS twitter
CALL apoc.load.jsonParams(twitter.users_list_url + "user_id="+result,{Authorization:"Bearer "+twitter.bearer},null) yield value
WITH value.id as id, value.name as name, value.screen_name as screen_name, value.location as location, value.followers_count as followers_count, value.friends_count as friends_count, value.favourites_count as favourites_count
MERGE (u:User {id: id})
ON MATCH SET u.location=location, u.followers_count=followers_count, u.friend_count = friends_count, u.favourites_count = favourites_count