UNWIND {user_locations} AS line
MATCH (u:User {id: line[0]}) SET u.location = line[1]