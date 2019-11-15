# This file shows how to use predict_nb to predict sentiment using Naive
# Bayeian model.

from sentiment import predict_nb
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


def main():
    test_single_tweet()


if __name__ == '__main__':
    main()
