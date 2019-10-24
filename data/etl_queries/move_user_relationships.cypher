// some users were only stored as screen_names with no ids
// some of those users changed their screen_names
// some of those users also had full nodes with ids
// this query moves the User-Tweet relationships from the only-screen_names to the complete users
MATCH (stubUsers:User)
WHERE stubUsers.id is null
with stubUsers.screen_name as ids
order by ids
skip 1400
WITH collect(ids)[..100] as user_ids
WITH REDUCE(s = HEAD(user_ids), n IN TAIL(user_ids) | s + ',' + n) AS result
CALL apoc.static.getAll("twitter") yield value AS twitter
CALL apoc.load.jsonParams(twitter.users_list_url + "screen_name="+result,{Authorization:"Bearer "+twitter.bearer},null) yield value
WITH value.id as id, value.name as name, value.screen_name as screen_name, value.location as location, value.followers_count as followers_count, value.friends_count as friends_count, value.favourites_count as favourites_count
MATCH (u:User {id: id})
MATCH (u2:User {screen_name: screen_name})
where u2.id is null
match (u2)-[r]-(x)
foreach (_ in CASE WHEN type(r) = "TWEETED" THEN [1] else [] end |
	merge (u)-[:TWEETED]->(x)
)
foreach (_ in CASE WHEN type(r) = "MENTIONS" THEN [1] else [] end |
	merge (u)<-[:MENTIONS]-(x)
)
foreach (_ in CASE WHEN type(r) = "RETWEETED" THEN [1] else [] end |
	merge (u)-[:RETWEETED]->(x)
)
detach delete u2