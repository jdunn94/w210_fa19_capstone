MATCH (u:User)-[r:TWEETS_ABOUT]->(:Topic {name: {search_term}})
  WHERE (NOT EXISTS(u.location) OR u.location="" OR u.location= " ") AND r.topical_volume > 0 RETURN u.id