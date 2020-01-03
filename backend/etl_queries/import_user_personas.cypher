UNWIND {user_persona_list} AS userPersona
MATCH (u:User {id: userPersona.user_id})-[r:TWEETS_ABOUT]->(:Topic {name: userPersona.search_term})
SET r.persona = userPersona.persona