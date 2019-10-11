CALL apoc.static.getAll("twitter") yield value AS twitter
CALL apoc.load.jsonParams(twitter.users_list_url + "screen_name="+"CHP_SF,HPP_SF,TNDC,LarkinStreet,abode_services,TheCoalitionSF",{Authorization:"Bearer "+twitter.bearer},null) yield value
WITH value.id as id, value.name as name, value.screen_name as screen_name, value.location as location, value.followers_count as followers_count, value.friends_count as friends_count, value.favourites_count as favourites_count
MERGE (u:User {id: id})
ON CREATE SET u.id = id, u.name = name, u.screen_name = screen_name, u.location=location, u.followers_count=followers_count, u.friend_count = friends_count, u.favourites_count = favourites_count