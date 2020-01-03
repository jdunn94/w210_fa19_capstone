WITH {users_to_migrate} as userIdList
UNWIND userIdList as currentUserId
MATCH (u:User {id: currentUserId})-[]-(:Tweet)<-[:GENERATED]-(t:Topic)
RETURN u, t.name