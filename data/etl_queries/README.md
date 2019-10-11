All of the queries are designed to be idempotent - running them multiple times should not corrupt existing data.  All updates are handled with merges to prevent duplication, etc.

- seed.cypher: add 6 housing organizations to the database, user nodes only.  the organizations are hard-coded
- get_timeline.cypher: provide the screen_name of the user and this will fetch the last 200 tweets for
- update.cypher: fetches the 100 most recent tweets with the word "homeless" in it.  can change the search term
- more_user_info.cypher: fetches data for all user nodes that are incomplete (missing follower count, etc.)  does not return list of friends, followers, or following


TODO:
- some tweets (replies) only show up in the graph as id's.  we should use the statuses/show.json endpoint to fetch the text info etc for these stubs