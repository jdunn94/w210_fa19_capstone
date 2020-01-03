import ast
from collections import Counter
import json
import os
from random import sample
import re

from constants import SEARCH_TOPICS_SIMILAR_TERMS
from database import DatabaseManager
from datastorage import AWSWriter
from nlpalgos import SentimentClassifier


QUERIES_PATH = "./etl_queries"
USER_TIMELINES_PATH = "data/user_timelines/"
NETWORK_RESULTS_PATH = "models/network"
NUM_HASHTAGS = 3
THRESHOLD = 1000
NUM_POPULAR_TWEETS = 3


class UserProfile:
    """Responsible for holding intermediate user profile statistics before merging into production database"""
    def __init__(self, user_id, topic, dbm, aws_writer, ignore_sentiment=False):
        """Constructor for UserProfile"""
        self.user_id = user_id
        self.dbm = dbm
        self.aws_writer = aws_writer
        self.sentiment_model = SentimentClassifier()
        self.threshold = THRESHOLD
        self.num_hashtags = NUM_HASHTAGS
        self.num_popular_tweets = NUM_POPULAR_TWEETS
        self.tweet_history = self._pull_tweet_history()
        self.topical_tweets = self._get_topical_tweets(topic)
        self.successfully_created = False
        if self.topical_tweets:
            if ignore_sentiment:
                self.tweet_sentiments = {str(tweet["id"]): "negative" for tweet in self.tweet_history}
            else:
                self.tweet_sentiments = self._predict_sentiment()
            self.individual_statistics = self._generate_individual_statistics()
            self.popular_tweets = self._get_topical_popular_tweets()
            self.common_hashtags = self._get_topical_hashtags()
            self.successfully_created = True

    def _predict_sentiment(self):
        tweet_sentiments = dict()
        tweet_tuples = list()
        for tweet in self.tweet_history:
            tweet_tuples.append((tweet["id"], tweet["full_text"]))

        predicted_tweet_tuples = self.sentiment_model.label_batch_tweets(tweet_tuples)
        for tweet in predicted_tweet_tuples:
            tweet_sentiments[tweet.id] = tweet.sentiment
        return tweet_sentiments

    def _get_topical_tweets(self, topic):
        """Apply a string search for given topic on a set of tweets and return tweets that match"""
        topic_or_adjacent_terms = r"\b" + r"|\b".join(SEARCH_TOPICS_SIMILAR_TERMS[topic])
        return [tweet for tweet in self.tweet_history if re.search(topic_or_adjacent_terms, tweet["full_text"].lower())]

    def _pull_tweet_history(self):
        """Pull a users tweet history from S3"""
        filepath = "data/user_timelines/" + str(self.user_id) + ".json"
        tweet_history = self.aws_writer.read_json(filepath)
        if tweet_history:
            return json.loads(tweet_history)
        else:
            return list()

    def _get_topical_sentiment(self):
        """From a list of user tweets predict the sentiment of the tweets that match a keyword"""
        positive_tweets = [tweet for tweet in self.topical_tweets
                           if self.tweet_sentiments[str(tweet["id"])] == "positive"]
        negative_tweets = [tweet for tweet in self.topical_tweets
                           if self.tweet_sentiments[str(tweet["id"])] == "negative"]
        positive_sentiment = len(positive_tweets) / len(self.topical_tweets)
        negative_sentiment = len(negative_tweets) / len(self.topical_tweets)
        return positive_sentiment, negative_sentiment

    def _get_topical_retweets(self, threshold=None):
        """Given a single user and their tweets, compute the percentage of topical tweets that are retweeted above a
        threshhold"""
        threshold = threshold or self.threshold
        topical_retweets = [tweet for tweet in self.topical_tweets if tweet['retweet_count'] > threshold]
        return len(topical_retweets)

    def _get_topical_hashtags(self, num_hashtags=None):
        """From a list of users and their topical tweets find all the hashtags that user writes and return the k most
        frequent hashtags"""
        num_hashtags = num_hashtags or self.num_hashtags
        topical_hashtags = list()
        [topical_hashtags.extend(tweet["entities"]["hashtags"]) for tweet in self.topical_tweets]
        topical_hashtags = [h["text"] for h in topical_hashtags]
        common_hashtags = Counter(topical_hashtags).most_common(num_hashtags)  # [(hashtag, count)]
        return common_hashtags

    def _get_topical_popular_tweets(self, num_popular_tweets=None):
        """Given a users tweets, return the k most popular tweets by favorites and retweets"""
        num_popular_tweets = num_popular_tweets or self.num_popular_tweets
        return sorted(self.topical_tweets,
                      key=lambda x: (x["retweet_count"], x["favorite_count"]), reverse=True)[:num_popular_tweets]

    def _generate_individual_statistics(self):
        stats = dict()
        stats["topical_volume"] = len(self.topical_tweets) / len(self.tweet_history)
        stats["positive_sentiment"], stats["negative_sentiment"] = self._get_topical_sentiment()
        stats["topical_retweets"] = self._get_topical_retweets()
        return stats


class ProfileBuilder:
    """Responsible for pulling users that do not have profile attributes in the production database, computing those
    statistics, and merging them into production for a single topic"""
    def __init__(self, topic, persona, ignore_sentiment=False):
        """Constructor for ProfileBuilder"""
        self.topic = topic
        self.persona = persona
        self.ignore_sentiment = ignore_sentiment
        self.aws_writer = AWSWriter()
        self.dbm = DatabaseManager()
        self.queries_path = QUERIES_PATH
        self.user_profile = None
        self.num_user_profiles_created = int()
        self.total_topical_volume = float()
        self.total_positive_sentiment = float()
        self.total_negative_sentiment = float()
        self.total_topical_retweets = int()

    def _get_noprofile_users(self, production_users):
        """Connect to S3 to pull leaders.txt and compare it against a list of users in production"""
        filename = self.topic + f"_{self.persona}.txt"
        topic_network_results_path = os.path.join(NETWORK_RESULTS_PATH, filename)
        network_results = ast.literal_eval(self.aws_writer.read_model(topic_network_results_path))
        noprofile_users = list(set(network_results) - set(production_users))
        return noprofile_users

    def _get_production_users(self, only_id=True):
        """Connect to Neo4j prod database and pull all user nodes that follow the pattern
        (:User)-[:TWEETED]->(:Tweet)<-[:GENERATED]-(:Topic)"""
        args = {"search_term": self.topic}
        if only_id:
            results = self.dbm.run_script(self.dbm.prod_driver,
                                          os.path.join(self.queries_path, "export_user_ids.cypher"),
                                          args=args,
                                          get_values=True)
            return [record[0] for record in results.values()]
        else:
            results = self.dbm.run_script(self.dbm.prod_driver,
                                          os.path.join(self.queries_path, "export_user_profiles.cypher"),
                                          args=args,
                                          get_values=True)
            return [record for record in results.values()]

    def _write_individual_statistics(self):
        """Extract properties from UserProfile object and send to DatabaseManager to merge prod User and Tweet nodes"""
        user_properties = dict()
        user_properties["user"] = self.user_profile.user_id
        user_properties.update(self.user_profile.individual_statistics)
        self.dbm.merge_user_profile(user_properties, self.user_profile.popular_tweets,
                                    self.user_profile.common_hashtags, self.topic)

    def _write_relative_statistics(self, user_properties):
        """Write relative statistics to database"""
        args = {"properties": user_properties}
        self.dbm.run_script(self.dbm.prod_driver,
                            os.path.join(self.queries_path, "import_relative_properties.cypher"),
                            args=args,
                            verbose=True)

    def build_user_profiles(self):
        """Exposed function for building user profiles to merge into production"""
        # iterate through users once to build out individual statistics
        production_users = self._get_production_users()
        noprofile_users = self._get_noprofile_users(production_users)
        # TODO: LIMITING NUMBER OF USERS TO ITERATE THROUGH FOR TIME CONSTRAINTS
        # TODO: UPDATE TO ALLOW FULL READ WHEN WE HAVE MORE TRAINING TIME
        if len(noprofile_users) > 50:
            noprofile_users = sample(noprofile_users, 50)
        for user_id in noprofile_users:
            self.user_profile = UserProfile(user_id, self.topic, self.dbm, self.aws_writer, ignore_sentiment=self.ignore_sentiment)
            if self.user_profile.successfully_created:
                self._write_individual_statistics()

        # iterate through all users once to compute total values
        production_users = self._get_production_users(only_id=False)
        num_production_users = len(production_users)

        # if there were no successful leaders with topical tweets found, break and move to next topic
        if num_production_users == 0:
            return False

        for user_data in production_users:
            # line = [user_id, topical_volume, positive_sentiment, negative_sentiment]
            self.total_topical_volume += user_data[1]
            self.total_positive_sentiment += user_data[2]
            self.total_negative_sentiment += user_data[3]

        average_topical_volume = self.total_topical_volume / num_production_users
        average_positive_sentiment = self.total_positive_sentiment / num_production_users
        average_negative_sentiment = self.total_negative_sentiment / num_production_users

        # iterate through all users to compute relative statistics
        stats = dict()
        for user_data in production_users:
            stats["user"] = user_data[0]
            stats["relative_volume"] = user_data[1] / average_topical_volume
            if average_positive_sentiment > 0.0:
                stats["relative_positive_sentiment"] = user_data[2] / average_positive_sentiment
            else:
                stats["relative_positive_sentiment"] = 0.0
            if average_negative_sentiment > 0.0:
                stats["relative_negative_sentiment"] = user_data[3] / average_negative_sentiment
            else:
                stats["relative_negative_sentiment"] = 0.0
            self._write_relative_statistics(stats)

    def build_user_profiles2(self):
        """Working on getting this right"""
        # iterate through users once to build out individual statistics
        production_users = self._get_production_users()
        # noprofile_users = self._get_noprofile_users(production_users)
        user_limit = 100
        for user_id in production_users:
            self.user_profile = UserProfile(user_id, self.topic, self.dbm, self.aws_writer, ignore_sentiment=self.ignore_sentiment)
            if self.user_profile.successfully_created:
                if user_limit <= 0:
                    break
                else:
                    self._write_individual_statistics()
                    user_limit -= 1

    def build_user_profiles3(self):
        """Almost there"""
        # run a query to pull all users that have a [TWEETS_ABOUT] relationship where r.topical_volume > 0
        # compute aggregate statistics and store them in (Topic)
        # iterate through all users once to compute total values
        args = {"search_term": self.topic}
        results = self.dbm.run_script(self.dbm.prod_driver,
                                      os.path.join(self.queries_path, "export_individual_stats_exist.cypher"),
                                      args=args,
                                      get_values=True)
        data = [record for record in results.values()]
        # data is list(list) [positive, negative, topical_volume, topical_retweets]
        num_community_users = len(data)
        for user_data in data:
            # line = [positive, negative, topical_volume, topical_retweets]
            self.total_positive_sentiment += user_data[0]
            self.total_negative_sentiment += user_data[1]
            self.total_topical_volume += user_data[2]
            self.total_topical_retweets += user_data[3]

        average_topical_volume = self.total_topical_volume / num_community_users
        average_positive_sentiment = self.total_positive_sentiment / num_community_users
        average_negative_sentiment = self.total_negative_sentiment / num_community_users
        average_topical_retweets = self.total_topical_retweets / num_community_users

        # WRITE AVERAGE STATISTICS HERE
        stats = {"avg_top_vol": average_topical_volume, "avg_pos_sent": average_positive_sentiment,
                 "avg_neg_sent": average_negative_sentiment, "avg_top_retweets": average_topical_retweets,
                 "topic": self.topic}
        args = {"average_statistics": stats}
        self.dbm.run_script(self.dbm.prod_driver,
                            os.path.join(self.queries_path, "import_average_stats.cypher"),
                            args=args,
                            verbose=True)
