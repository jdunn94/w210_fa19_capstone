UNWIND {tweets_with_text} AS tweetText
MATCH (t:Tweet {id: tweetText.id})
SET t.text = tweetText.text