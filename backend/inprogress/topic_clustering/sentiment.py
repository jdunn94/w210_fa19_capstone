# Take tweets from training dataset, then train classificer.

import constants
import nltk
import numpy as np
import os
import pandas as pd
import pickle
import sys

from collections import Counter
from collections import namedtuple
from nlp import nlp
from nltk.classify import apply_features
from nltk.classify.scikitlearn import SklearnClassifier
from nltk.probability import FreqDist
from sklearn.naive_bayes import BernoulliNB
from sklearn.svm import SVC

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
    stop_words = constants.sentiment_stop_words
    stop_words.extend(constants.sentiment_extra_stop_words)
    all_words = []
    for words in X:
        cleaned_words = [word for word in words if word not in stop_words]
        all_words.extend(cleaned_words)
    return all_words


def get_word_features(wordlist, vocab_size=3000):
    counter = Counter(wordlist)
    counter = Counter(counter.most_common(vocab_size))
    total = sum(counter.values(), 0.0)
    word_features = {}
    for word in counter:
        word_features[word[0]] = word[1] / total
    with open(os.path.join('data', 'words.txt'), 'w') as f:
        for k, v in word_features.items():
            f.write("'{}',".format(k))
    return word_features


def extract_features(word_features, document, debug=False):
    document_words = set(document)
    features = {}
    for word in word_features:
        features[word] = (word_features[word] if word in document_words else 0)
    if debug:
        for word, score in features.items():
            if score > 0:
                print('{}={}'.format(word, score))
    return features


def train_model(X, Y, model, load_word_features):
    all_words = get_words_in_tweets(X)

    filename = os.path.join('data', 'word_features.pkl')
    word_features = None
    if not load_word_features:
        word_features = get_word_features(all_words)
        with open(filename, 'wb') as f:
            pickle.dump(word_features, f)
            print('Save to ', filename)
    else:
        with open(filename, 'rb') as f:
            word_features = pickle.load(f)
            print('Load ', filename)

    data_tuples = [(X[i], Y[i]) for i in range(0, len(X))]
    training_set = [(extract_features(word_features, document), label) for
                    (document, label) in data_tuples]
    classifier = None
    if model == "BernoulliNB":
        classifier = SklearnClassifier(BernoulliNB())
    elif model == "SVC":
        classifier = SklearnClassifier(SVC(gamma='auto'))
    else:
        raise Exception('Unknown model:'.format(model))

    classifier.train(training_set)
    # Test training accuracy
    test_set = training_set[:2000]
    print("test on first 2000 training set accuracy percent:",
          (nltk.classify.accuracy(classifier, test_set)) * 100)

    with open(os.path.join('data', '{}.pkl'.format(model)), 'wb') as f:
        pickle.dump(classifier, f)
        print('Save to model: {}.pkl'.format(model))


def predict_nb(raw_tweet_tuple, model='BernoulliNB', debug=False):
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
    with open(os.path.join('data', '{}.pkl'.format(model)), 'rb') as f:
        classifier = pickle.load(f)
        print('Load data/{}.pkl'.format(model))
        if DEBUG:
            print('test=', test)
        sentiment = classifier.classify(test)
        if DEBUG:
            print('sentiment = ', sentiment)
        result = RawTweet(id=raw_tweet_tuple.id, text=raw_tweet_tuple.text,
                          sentiment=sentiment)
    return result


def main(
        training_filename,
        model,
        load_training_data=True,
        load_word_features=False):
    # load the raw tweets and train them.
    if load_training_data:
        data = read_file(training_filename)
        (X, Y) = process_tweet(data)
    else:
        with open(os.path.join('data', 'tokens.pkl'), 'rb') as f:
            X = pickle.load(f)
        with open(os.path.join('data', 'Y.pkl'), 'rb') as f:
            Y = pickle.load(f)
    # start to train
    train_model(X, Y, model=model, load_word_features=load_word_features)
    # smoke_test()


def smoke_test():
    print('\n*Starting to do smoke test*')
    positive_text = "@switchfoot http://twitpic.com/2y1zl - Awww, that's a bummer.  You shoulda got David Carr of Third Day to do it. ;D"
    raw_tweet_tuple = RawTweet(
        id='111',
        text=positive_text,
        sentiment='unknown')
    new_tweet_tuple = predict_nb(raw_tweet_tuple, model=model, debug=True)
    print('Predict result=', new_tweet_tuple)
    negative_text = "@Cliff_Forster Yeah, that does work better than just waiting for it In the end I just wonder if I have time to keep up a good blog."
    raw_tweet_tuple = RawTweet(
        id='111',
        text=negative_text,
        sentiment='unknown')
    new_tweet_tuple = predict_nb(raw_tweet_tuple, model=model, debug=True)
    print('Predict result=', new_tweet_tuple)
    neutral = RawTweet(id='111', text="a b",
                       sentiment='unknown')
    new_tweet_tuple = predict_nb(neutral, model=model, debug=True)
    print('Predict result=', new_tweet_tuple)


if __name__ == '__main__':
    if (len(sys.argv) < 3):
        raise Exception(
            '{} training_file.csv SVC(BernoulliNB) load_word_features'.format(
                sys.argv[0]))

    load_word_features = False
    load_training_data = True
    if len(sys.argv) >= 4 and sys.argv[3] == 'load_word_features':
        load_word_features = True
        load_training_data = False

    main(training_filename=sys.argv[1],
         model=sys.argv[2],
         load_training_data=load_training_data,
         load_word_features=load_word_features)
