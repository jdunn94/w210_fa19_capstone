WITH {properties} as userUpdate
MATCH (u:User {id: userUpdate.user})
SET u.relative_volume = userUpdate.relative_volume, u.relative_positive_sentiment = userUpdate.relative_positive_sentiment,
u.relative_negative_sentiment = userUpdate.relative_negative_sentiment