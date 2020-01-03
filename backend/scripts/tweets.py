from datetime import date
import json
import os
from requests.exceptions import Timeout, ConnectionError

import tweepy

from datastorage import AWSWriter

ACCESS_KEY = os.environ.get("TWITTER_ACCESS_KEY")
ACCESS_SECRET = os.environ.get("TWITTER_ACCESS_SECRET")
API_LIMIT = 20
CONSUMER_KEY = os.environ.get("TWITTER_CONSUMER_KEY")
CONSUMER_SECRET = os.environ.get("TWITTER_CONSUMER_SECRET")
ESTIMATED_USER_AVERAGE = 3 * 365 * 3  # tweets per day * days per year * 3 year recency window


class TweetGetter:
    """Responsible for connecting to the Twitter Python API and writing data to json storage in S3"""
    def __init__(self):
        """Constructor for the TweetGetter class"""
        self.twitter_api = self.connect_twitter_api()
        self.api = None
        self.api_params = dict()
        self.api_limit = API_LIMIT
        self.outpath = str()
        self.aws_writer = AWSWriter()

    @staticmethod
    def connect_twitter_api():
        """Spin up a Twitter API object"""
        auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
        auth.set_access_token(ACCESS_KEY, ACCESS_SECRET)
        return tweepy.API(auth)

    def _get_data(self):
        """Instantiate a method for getting data from tweepy depending on the task for subclasses"""
        results = list()
        cursor = tweepy.Cursor(self.api, **self.api_params, tweet_mode="extended",
                               wait_on_rate_limit=True, wait_on_rate_limit_notify=True,
                               count=200).items(self.api_limit)

        # Rewrite cursor pull to skip users that are private (401)
        while True:
            try:
                status = cursor.next()
                results.append(status._json)
            except tweepy.TweepError:
                return None
            except StopIteration:
                break

        return json.dumps(results, ensure_ascii=False)

    def _write_data(self, data):
        """Writes Twitter data to json files according to the specified outpath"""
        if data:
            filename = self.outpath + str(date.today()).replace("-", "_") + ".json"
            self.aws_writer.write_json(data, filename)

    def _write_user_timeline(self, data):
        """Writes user timeline data"""
        if data:
            filename = self.outpath + ".json"
            self.aws_writer.write_json(data, filename)


class TweetSearcher(TweetGetter):
    """Responsible for hitting the Twitter Search API using a set of search terms and saving them to s3/search/


    Each TweetSearcher is responsible for a single search term"""
    def __init__(self, search_term):
        """Constructor for the TweetSearcher object"""
        super().__init__()
        self.search_term = search_term
        self.api = self.twitter_api.search
        self.api_params = {"q": self.search_term, "geocode": "39.989450,-98.859097,1000mi"}
        self.outpath = "data/tweets/" + self.search_term + "_tweets_"

    def get_search_tweets(self):
        """Exposed function for getting and writing tweets that match a search term"""
        searched_tweets = self._get_data()
        self._write_data(searched_tweets)


class UserTimelineGetter(TweetGetter):
    """Responsible for hitting the Twitter User Timeline API and pulling all the tweets from a users timeline

    Each UserTimelineGetter is responsible for one user"""
    def __init__(self, user):
        """Constructor for UserTimelineGetter"""
        super().__init__()
        self.api = self.twitter_api.user_timeline
        self.api_params = {"user_id": user}
        self.api_limit = ESTIMATED_USER_AVERAGE
        self.outpath = "data/user_timelines/" + str(user)

    def get_user_timeline(self):
        """Exposed function for getting and writing a user timeline"""
        user_timeline = self._get_data()
        self._write_user_timeline(user_timeline)


class UserFollowerGetter(TweetGetter):
    """Responsible for hitting the Twitter Followers API and return a list of users that follow a given user for
    imputing a user's location

    Each UserFollowerGetter is responsible for one user"""
    def __init__(self, user):
        """Constructor for UserFollowerGetter"""
        super().__init__()
        self.api = self.twitter_api.followers
        self.api_params = {"user_id": user}
        self.api_limit = 1000

    def get_user_followers(self):
        """Exposed function for getting user followers and returning a list of followers and their locations"""
        user_followers = json.loads(self._get_data())
        return [(u['id'], u['location']) for u in user_followers]


class RetweetFullTextGetter(TweetGetter):
    """Responsible for hitting the Twitter GET/STATUS API and return a list of tweet ids and their full text

    Each RetweetFullTextGetter is responsible for a batch of tweets"""

    def __init__(self, tweet_ids):
        """Constructor for RetweetFullTexxtGetter"""
        super().__init__()
        self.api = self.twitter_api.statuses_lookup
        self.tweet_ids = tweet_ids

    def _get_data(self):
        return self.api(self.tweet_ids, tweet_mode="extended")

    def get_tweet_full_text(self):
        """Exposed function for getting a batch of retweets full text"""
        data = self._get_data()
        full_text_map = dict()
        for line in data:
            if "retweeted_status" in line._json:
                full_text_map[line._json["id"]] = "RT: " + line._json["retweeted_status"]["full_text"]
            elif "quoted_status" in line._json:
                full_text_map[line._json["id"]] = "RT: " + line._json["quoted_status"]["full_text"]
        return full_text_map
