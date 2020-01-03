MATCH (u1:User {id: {user_id}}) WITH u1
MATCH (:Topic {name: {search_term}})-[:GENERATED]->(t:Tweet)<-[r1]-(u1) WITH t, r1, u1
OPTIONAL MATCH (u1)-[r1]->(t)-[r2]-(u2:User)
RETURN TYPE(r1), TYPE(r2)