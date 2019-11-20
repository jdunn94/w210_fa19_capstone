# This file shows how to use predict_nb to predict sentiment using Naive
# Bayeian model.

import os
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score

from sentiment import predict_nb,predict_nb_batch
from sentiment import RawTweet

def test_single_tweet():
    text = "@switchfoot http://twitpic.com/2y1zl - Awww, that's a bummer.  You shoulda got David Carr of Third Day to do it. ;D"
    raw_tweet_tuple = RawTweet(id='111', text=text, sentiment='')
    new_tweet_tuple = predict_nb(
        raw_tweet_tuple,
        #model='BernoulliNB',
        model='SVC',
        debug=True)
    print('Predict result=', new_tweet_tuple)


def read_file(CSV_FILENAME, DEBUG=False):
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

def test_batch():
  test_filename = os.path.join('data', 'test_100.csv')
  data = read_file(test_filename)
  ids = data['id']
  tweets = data['text']
  labels = np.where(data['label'] == 0, 'negative', 'positive')
  tests = []
  for i in range(len(tweets)):
    test = RawTweet(id=ids[i], text=tweets[i], sentiment='unknown')
    tests.append(test)
  predicted = predict_nb_batch(tests, model='SVC', debug=False)
  pred_labels = []
  for i in range(len(predicted)):
    tweet = predicted[i]
    pred_labels.append(tweet.sentiment)
    if (labels[i] != tweet.sentiment):
      print('Missed:{}\n{}\ntrue_label:{}, predicted:{}\n\n'.format( 
          tweet.text, tests[i], labels[i], tweet.sentiment))

  #print(labels)
  #print(pred_labels)
  acc = accuracy_score(labels, pred_labels)
  print('Prediction acc {}'.format(acc))


def main():
    #test_single_tweet()
    test_batch()

if __name__ == '__main__':
    main()
