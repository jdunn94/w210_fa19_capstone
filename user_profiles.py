"""
I don't want to run out of memory so I'll be doing this one user at a time

Will be slower but more memory efficient
"""
from collections import Counter
import re
import tweepy
from topic_clustering.sentiment import predict_nb
from topic_clustering.sentiment import RawTweet
from location import predict_location
from neo4j import GraphDatabase

CYPHER_QUERIES = {
    "read_all_leaders": "MATCH (u:User) WHERE u.leader=True RETURN u.id LIMIT 100",
    "read_new_leaders": "MATCH (u:User) WHERE u.leader=True AND NOT EXISTS(u.topical_volume) RETURN u.id LIMIT 10"
}


"""
Database functions
"""


CONSUMER_KEY = ""
CONSUMER_SECRET = ""
ACCESS_KEY = ""
ACCESS_SECRET = ""


def connect_twitter_api():
    auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
    auth.set_access_token(ACCESS_KEY, ACCESS_SECRET)
    return tweepy.API(auth)


def connect_database():
    """Spin up a neo4j driver"""
    uri = "bolt://mcai.dataerrant.com:7687"
    driver = GraphDatabase.driver(uri, auth=("neo4j", "mcai2019"))
    return driver


def write_augmented_users(driver, nested, batch=True, batch_size=10000):
    """Merge model results back into the Neo4j database"""
    if batch:
        chunks = (len(nested) - 1) // batch_size + 1
        for i in range(chunks):
            batch = nested[i * batch_size:(i + 1) * batch_size]
            query = "UNWIND " + str(batch) + "AS line MERGE (u:User {id: line[0]}) " + \
                "SET u.topical_volume = line[1], u.topical_sentiment = line[2], u.topical_retweets = line[3], " + \
                "u.common_hashtags = line[4], u.location = line[5], u.relative_volume = line[6], " + \
                "u.relative_sentiment = line[7]"

            with driver.session() as session:
                session.run(query)


def write_popular_tweets(driver, nested, batch=True, batch_size=10000):
    pass


"""
Helper functions
"""


def mean(iter_):
    return sum(iter_) / len(iter_)


def process_status(status_json):
    """Takes a tweet json and transforms it into a usable format"""
    processed_status = dict()
    top_level_fields = ["retweet_count", "favorite_count", "text", "id", "created_at"]
    for field in top_level_fields:
        processed_status[field] = status_json[field]

    # process hashtags manually for now
    hashtags = status_json["entities"]["hashtags"]
    processed_status["hashtags"] = [h["text"] for h in hashtags]

    return processed_status


def get_target_users(driver, target='read_all_leaders'):
    """Access the Neo4j database and pull all users with user.leader==True"""
    if target in CYPHER_QUERIES.keys():
        query = CYPHER_QUERIES[target]
        with driver.session() as session:
            results = session.run(query)

        return [x[0] for x in results.values()]


def get_user_tweet_history(twitter_api, user, limit=100):
    """Given a user id, hit Twitter API and return all of a users tweets"""
    results = list()
    for status in tweepy.Cursor(twitter_api.user_timeline, user_id=user).items(limit):
        results.append(process_status(status._json))

    return results


def get_topical_tweets(user_tweets, keyword):
    """Given a user and their tweets, return a subset of those tweets that contain a keyword"""
    topical_tweets = list()
    total_tweets = len(user_tweets)
    for tweet in user_tweets:
        tweet_text = tweet['text']
        if re.search(keyword, tweet_text):
            topical_tweets.append(tweet)

    return topical_tweets, total_tweets


def get_topical_volume(topical_tweets, total_tweets):
    """Given a single user's tweets return the percentage whose text contains a keyword"""
    return len(topical_tweets) / total_tweets


def get_relative_volume(user_volume, avg_volume):
    """Given a single user and a list of all users topical volumes, compute the topical volume for this user relative
    to the group average"""
    return user_volume / avg_volume


def get_topical_sentiment(topical_tweets):
    """From a list of user tweets predict the sentiment of the tweets that match a keyword"""
    tweet_sentiments = dict()
    for tweet in topical_tweets:
        raw_tweet_tuple = RawTweet(id=tweet['id'], text=tweet['text'], sentiment='')
        predicted_sentiment = predict_nb(raw_tweet_tuple)
        tweet_sentiments[tweet['id']] = predicted_sentiment
    topical_sentiment = len([x for x in tweet_sentiments.values() if x == 'positive']) / len(tweet_sentiments.values())
    return topical_sentiment


def get_relative_sentiment(user_sentiment, avg_sentiment):
    """From a list of users and their topical sentiments, compute the topcial sentiment for each user relative to
    the group average"""
    return user_sentiment / avg_sentiment


def get_topical_retweets(topical_tweets, threshold=1000):
    """Given a single user and their tweets, compute the percentage of topical tweets that are retweeted above a
    threshhold"""
    topical_retweets = [x for x in topical_tweets if x['retweet_count']>threshold]
    return len(topical_retweets)


def get_hashtag_usage(topical_tweets, k):
    """From a list of users and their topical tweets find all the hashtags that user writes and return the k most
    frequent hashtags"""
    topical_hashtags = list()
    [topical_hashtags.extend(tweet['hashtags']) for tweet in topical_tweets]
    common_hashtags = Counter(topical_hashtags).most_common(k)
    return common_hashtags


def get_popular_tweets(user_tweets, k):
    """Given a users tweets, return the k most popular tweets by favorites and retweets"""
    top_tweets = sorted(user_tweets, key=lambda x: (x['retweet_count'], x['favorite_count']), reverse=True)[:k]
    return top_tweets


def get_topical_mentions(users, keyword):
    """From a list of users, hit the Twitter API to get a list of tweets that are mention this user and compute the
    length of the subset of mentions that contain a keyword"""
    # TODO: This one is more complicated save for later
    pass


def get_reply_chain_length(users, keyword):
    """From a list of users, hit the Twitter API to get a list of tweets that are replies to this user and compute
    the subset that contain a keyword, then get the average chain length"""
    # TODO: This one is more complicated, save for later
    pass


def predict_user_location(user_tweets):
    """Given a user and their tweet created_at dates, returns a predicted location for the user"""
    return predict_location(user_tweets).item(0)


def augment_users(users, twitter_api):
    augmented_users = list()
    for user_ in users:
        # get a users tweet history
        tweet_history_ = get_user_tweet_history(twitter_api, user_)
        # find the tweets that are topical
        topical_tweets_, total_tweets_ = get_topical_tweets(tweet_history_, 'homeless')
        # find the volume of a users tweets that are topical
        topical_volume_ = get_topical_volume(topical_tweets_, total_tweets_)
        # TODO: Build in a "skip this user" if there are 0 topical tweets
        # find the topical sentiment of a user
        if topical_volume_:
            topical_sentiment_ = get_topical_sentiment(topical_tweets_)
        else:
            topical_sentiment_ = 0.0
        # find the topical retweets of a user
        topical_retweets_ = get_topical_retweets(topical_tweets_)
        # find the 3 most common hashtags a user users in these topical tweets
        user_hashtags_ = get_hashtag_usage(topical_tweets_, 3)
        if not user_hashtags_:
            user_hashtags_ = 'null'

        # get the 3 most popular tweets from a user
        popular_tweets_ = get_popular_tweets(tweet_history_, 3)
        # predict the users location
        user_location_ = predict_user_location(tweet_history_)

        # create a list with each element in the following order
        augmented_users.append([user_, topical_volume_, topical_sentiment_,
                                topical_retweets_, user_hashtags_, popular_tweets_, user_location_])

    # iterate through augmented list of users to generate relative statistics
    # get totals once
    all_volumes = [x[1] for x in augmented_users]
    all_sentiment = [x[2] for x in augmented_users]
    avg_volume_ = mean(all_volumes)
    avg_sentiment_ = mean(all_sentiment)

    for user_ in augmented_users:
        if avg_volume_ > 0.0:
            # compute the relative topical volume for a user
            # topical volume is in position [1]
            relative_volume_ = get_relative_volume(user_[1], avg_volume_)
        else:
            relative_volume_ = 0.0

        if avg_sentiment_ > 0.0:
            # compute the relative topical sentiment for a user
            # topical sentiment is in position [2]
            relative_sentiment_ = get_relative_sentiment(user_[2], avg_sentiment_)
            # add both to the current user list
        else:
            relative_sentiment_ = 0.0
        user_.extend([relative_volume_, relative_sentiment_])

    return augmented_users


"""
All together now
"""


def main():
    # first spin up a neo4j driver and a twitter api
    driver_ = connect_database()
    twitter_api_ = connect_twitter_api()

    # then grab a list of user ids that we need to augment
    users_ = get_target_users(driver_)

    # augment those users
    augmented_users_ = augment_users(users_, twitter_api_)

    # remove the tweets from augmented_users
    popular_tweets_ = [[line[0], line.pop(5)] for line in augmented_users_]

    # batch the nested augmented users and write into neo4j
    write_augmented_users(driver_, augmented_users_)

main()
