WITH {users_to_migrate} as userList
UNWIND userList as userData
MERGE (user:User {id: userData.id})
ON CREATE SET user.id=userData.id, user.friend_count= userData.friends_count,
  user.favourites_count=userData.favourites_count, user.description=userData.description,
  user.screen_name = userData.screen_name, user.followers_count=userData.followers_count,
  user.location=userData.location, user.name = userData.name, user.created = userData.created,
  user.persona = userData.persona
ON MATCH SET user.screen_name = userData.screen_name, user.friend_count= userData.friends_count,
  user.favourites_count=userData.favourites_count, user.description=userData.description,
  user.followers_count=userData.followers_count, user.location=userData.location, user.name=userData.name,
  user.created = userData.created, user.persona = userData.persona