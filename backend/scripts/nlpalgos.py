import os


from database import DatabaseManager
from topic_clustering.sentiment import predict_nb, predict_nb_batch, RawTweet


QUERIES_PATH = "./etl_queries"


class SentimentClassifier:
    """Responsible for training and applying NLP models built in topic_clustering module"""
    def __init__(self):
        """Constructor for SentimentClassifier"""
        self.data = None
        self.dbm = DatabaseManager()

    def train(self, data):
        """Train NLP model on data and return labeled data"""
        pass

    def _write_tweet_sentiments(self):
        args = {"properties": self.data}
        self.dbm.run_script(self.dbm.prod_driver,
                            os.path.join(QUERIES_PATH, "import_tweet_sentiments.cypher"),
                            args=args,
                            verbose=True)

    def fit(self, data):
        """Fits data to model and applies NLP to classify tweet sentiments as [positive, negative, unknown]
        Input data must be list of tuple-like [(tweet_id, tweet_text)]"""
        results = list()
        for line in data:
            tweet_id = line[0]
            tweet_text = line[1]
            raw_tweet_tuple = RawTweet(id=str(tweet_id), text=str(tweet_text), sentiment="")
            labeled_tweet_tuple = predict_nb(raw_tweet_tuple, model="SVC", debug=False)
            sentiment_prediction = dict()
            sentiment_prediction["id"] = labeled_tweet_tuple.id
            sentiment_prediction["sentiment"] = labeled_tweet_tuple.sentiment
            results.append(sentiment_prediction)
        self.data = results
        self._write_tweet_sentiments()

    @staticmethod
    def label_batch_tweets(tweet_tuples):
        """Labels a list of (tweet_id, tweet_text) tuple with sentiment according to NLP model"""
        list_of_raw_tweet_tuple = list()
        # TODO: BATCH HERE
        for tweet_id, tweet_text in tweet_tuples:
            list_of_raw_tweet_tuple.append(RawTweet(id=str(tweet_id), text=str(tweet_text), sentiment=""))
        predicted_tweet_tuples = predict_nb_batch(list_of_raw_tweet_tuple, model='SVC', debug=False)
        return predicted_tweet_tuples
