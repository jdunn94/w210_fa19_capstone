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
        self.api_params = {"q": self.search_term}
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
