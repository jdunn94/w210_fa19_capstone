MATCH (u:User) WHERE NOT (u)-[:POPULAR_TWEETED]-(:Tweet) RETURN u.id