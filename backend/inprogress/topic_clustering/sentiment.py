# Take tweets from training dataset, then train classificer.

import numpy as np
import os
import pandas as pd
import pickle
import sys
import nltk

from collections import Counter
from collections import namedtuple
from nlp import nlp
from nltk.classify import apply_features
from nltk.classify.scikitlearn import SklearnClassifier
from nltk.probability import FreqDist
from sklearn.naive_bayes import BernoulliNB

# Raw_tweet is a data structure used for prediction
RawTweet = namedtuple('RawTweet', ['id', 'text',
                                   'sentiment'])

DEBUG = False


def read_file(CSV_FILENAME):
    # "0","1467810369","Mon Apr 06 22:19:45 PDT 2009","NO_QUERY","_TheSpecialOne_","@switchfoot http://twitpic.com/2y1zl - Awww, that's a bummer.  You shoulda got David Carr of Third Day to do it. ;D"
    data = pd.read_csv(CSV_FILENAME,
                       dtype={
                           'label': 'int',
                           'id': 'float',
                           'date': 'str',
                           'query': 'str',
                           'category': 'str',
                           'text': 'str'},
                       names=['label', 'id', 'date', 'query', 'category',
                              'text'],
                       skip_blank_lines=True,
                       header=None,
                       verbose=True,
                       encoding="ISO-8859-1")
    if DEBUG:
        print(data.describe())
        print(data.columns)
        print(data.shape)
    data = data[data.text != '']
    data['sentiment'] = np.where(data['label'] == 0, 'negative', 'positive')
    if DEBUG:
        print(data.head())
    print(data.shape)
    return data


def process_tweet(data):
    tweets = data['text']
    labels = data['sentiment']
    (X, Y) = nlp(tweets, labels, simple_version=True)
    if DEBUG:
        print('size of X:', len(X))
        print('size of Y:', len(Y))
        print('sample of X:', X[1:10])
        print('sample fo Y:', Y[1:10])
    with open(os.path.join('data', 'tokens.pkl'), 'wb') as f:
        pickle.dump(X, f)
    with open(os.path.join('data', 'Y.pkl'), 'wb') as f:
        pickle.dump(Y, f)
    return (X, Y)


def get_words_in_tweets(X):
    """
    X is a list of list of tokens. Tokens are from nlp.py
    """
    all_words = []
    for words in X:
        all_words.extend(words)
    return all_words


def get_word_features(wordlist, vocab_size=3000):
    counter = Counter(wordlist)
    counter = Counter(counter.most_common(vocab_size))
    total = sum(counter.values(), 0.0)
    word_features = {}
    for word in counter:
        word_features[word[0]] = word[1] / total
    i = 0
    for k, v in word_features.items():
      i += 1
      print('{}:\t{}={}'.format(i,k,v))
      if i >= 100:
        break
    return word_features


def extract_features(word_features, document, debug=False):
    document_words = set(document)
    features = {}
    for word in word_features:
        features[word] = (word_features[word] if word in document_words else 0)
    if debug:
        for word,score in features.items():
            if score > 0:
                print('{}={}'.format(word, score))
    return features


def train_nb(X, Y):
    all_words = get_words_in_tweets(X)
    word_features = get_word_features(all_words)
    with open(os.path.join('data', 'word_features.pkl'), 'wb') as f:
        pickle.dump(word_features, f)
        print('Save to data/word_features.pkl')
    data_tuples = [(X[i], Y[i]) for i in range(0, len(X))]
    training_set = [(extract_features(word_features, document), label) for
                    (document, label) in data_tuples]
    BernoulliNB_classifier = SklearnClassifier(BernoulliNB())
    BernoulliNB_classifier.train(training_set)
    # Test training accuracy
    test_set = training_set[:1000]
    print("BernoulliNB_classifier on first 1000 training set accuracy percent:",
          (nltk.classify.accuracy(BernoulliNB_classifier, test_set)) * 100)
    with open(os.path.join('data', 'BernoulliNB.pkl'), 'wb') as f:
        pickle.dump(BernoulliNB_classifier, f)
        print('Save to model: BernoulliNB.pkl')


def predict_nb(raw_tweet_tuple, debug=False):
    """
    This function takes a RawTweet which is a (id, tweet, dummy_sentiment),
    returns a new RawTweet which has a predicted sentiment.
    """
    tweets = np.array([raw_tweet_tuple.text])
    labels = ['unknown']

    # Process text to get tokens into test_X.
    (test_X, test_Y) = nlp(tweets, labels, simple_version=True)

    if len(test_X) == 0:
        return RawTweet(id=raw_tweet_tuple.id, text=raw_tweet_tuple.text,
                        sentiment='unknown')

    # Get features from tokens
    word_features = None
    with open(os.path.join('data', 'word_features.pkl'), 'rb') as f:
        word_features = pickle.load(f)
        print('Load data/word_features.pkl with size {}'.format(len(word_features)))
    test = extract_features(word_features, test_X[0], debug=debug)
    with open(os.path.join('data', 'BernoulliNB.pkl'), 'rb') as f:
        BernoulliNB_classifier = pickle.load(f)
        print('Load data/BernoulliNB.pkl')
        if DEBUG:
            print('test=', test)
        sentiment = BernoulliNB_classifier.classify(test)
        if DEBUG:
            print('sentiment = ', sentiment)
        result = RawTweet(id=raw_tweet_tuple.id, text=raw_tweet_tuple.text,
                          sentiment=sentiment)
    return result


def main(data_filename, load=True):
    # load the raw tweets and train them.
    if load:
        data = read_file(data_filename)
        (X, Y) = process_tweet(data)
    else:
        with open(os.path.join('data', 'tokens.pkl'), 'rb') as f:
            X = pickle.load(f)
        with open(os.path.join('data', 'Y.pkl'), 'rb') as f:
            Y = pickle.load(f)
    train_nb(X, Y)

    positive_text = "@switchfoot http://twitpic.com/2y1zl - Awww, that's a bummer.  You shoulda got David Carr of Third Day to do it. ;D"
    raw_tweet_tuple = RawTweet(
        id='111',
        text=positive_text,
        sentiment='unknown')
    new_tweet_tuple = predict_nb(raw_tweet_tuple, debug=True)
    print('Predict result=', new_tweet_tuple)
    negative_text = "@Cliff_Forster Yeah, that does work better than just waiting for it In the end I just wonder if I have time to keep up a good blog."
    raw_tweet_tuple = RawTweet(
        id='111',
        text=negative_text,
        sentiment='unknown')
    new_tweet_tuple = predict_nb(raw_tweet_tuple, debug=True)
    print('Predict result=', new_tweet_tuple)


if __name__ == '__main__':
    if (len(sys.argv) < 2):
        raise Exception('{} training_file.csv'.format(sys.argv[0]))
    main(sys.argv[1])
