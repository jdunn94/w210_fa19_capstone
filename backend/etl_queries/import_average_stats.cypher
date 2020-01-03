WITH {average_statistics} AS stats
MATCH (top:Topic {name: stats.topic})
SET top.average_topical_volume = stats.avg_top_vol, top.average_positive_sentiment = stats.avg_pos_sent,
  top.average_negative_sentiment = stats.avg_neg_sent, top.average_topical_retweets = stats.avg_top_retweets