WITH {properties} AS labeledTweets
UNWIND labeledTweets AS newTweet
MATCH (t:Tweet {id: newTweet.id}) SET t.sentiment = newTweet.sentiment