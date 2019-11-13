import joblib
import json
import re

import numpy as np
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_validate
from sklearn.metrics import accuracy_score

def get_location_mode(locations):
    """Takes a list of multiple locations and returns a str of the most frequent"""
    return max(set(locations), key=locations.count)


def load_twitter_json(filepath):
    """Reads input json and reshapes to a nested dictionary keyed by user"""
    # instantiate output dictionary
    results = dict()

    with open(filepath, 'r') as fp:
        data = json.load(fp)
    time_regex = r"([0-1]?\d|2[0-3]):([0-5]?\d):([0-5]?\d)"

    for location in data:
        # location is a str representing place
        # data[location] is a dict with keys (geocode, since_id, statuses)
        # we want statuses, a nested dict of tweet_ids
        for tweet_id in data[location]['statuses']:
            tweet_timestamp = data[location]['statuses'][tweet_id]['created_at']
            tweet_time = re.search(time_regex, tweet_timestamp).group()
            user_id = str(data[location]['statuses'][tweet_id]['user']['id'])

            if user_id not in results:
                results[user_id] = dict()
                # instantiate location as a list and append this location
                results[user_id]['location'] = list()
                results[user_id]['tweets'] = list()

            # I suspect geocode is linked to tweet and not user, let's take majority as user location
            # append the location
            results[user_id]['location'].append(location)
            results[user_id]['tweets'].append((tweet_id, tweet_time))

    for user in results:
        results[user]['location'] = get_location_mode(results[user]['location'])

    return results


def get_labels_and_features(data, fractional=True):
    labels = dict()
    user_tweet_times = dict()

    for user_id in data:
        labels[user_id] = data[user_id]['location']

        hourly_buckets = {k: 0 for k in range(0, 24)}
        for tweet_id, tweet_time in data[user_id]['tweets']:
            hour = int(tweet_time.split(':')[0])
            hourly_buckets[hour] += 1
        if fractional:
            total_tweets = sum(hourly_buckets.values())
            hourly_buckets = {k: x/total_tweets for k, x in hourly_buckets.items()}
        user_tweet_times[user_id] = hourly_buckets

    return labels, user_tweet_times


def preprocess_new_data(data, fractional=True):
    """list of dict with created_at:'Mon Oct 28 15:04:51 +0000 2019'"""
    hourly_buckets = {k: 0 for k in range(0, 24)}
    for tweet in data:
        hour = int(tweet['created_at'].split(" ")[3].split(':')[0])
        hourly_buckets[hour] += 1
        if fractional:
            total_tweets = sum(hourly_buckets.values())
            hourly_buckets = {k: x / total_tweets for k, x in hourly_buckets.items()}
    return list(hourly_buckets.values())


def basic_model(data):
    """Testing end to end model"""
    # labels are user_id mapped to location names
    # features are user_id mapped to 0-24 hourly percentages of tweets
    labels, features = get_labels_and_features(data)

    # pipe into a naive bayes classifier
    y = np.array(list(labels.values()))
    X = np.array([list(val) for key, val in features.items()])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    model = MultinomialNB().fit(X_train, y_train)
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print("Single model train and predict")
    print(f"Accuracy: {accuracy}")

    # cross validate
    cv_results = cross_validate(MultinomialNB(), X, y, scoring='accuracy', cv=5, return_train_score=True)
    print(f"Cross validated average score over 5-Fold: {np.mean(cv_results['test_score'])}")

    return model

def train():
    data = load_twitter_json('./location.json')
    model = basic_model(data)
    joblib.dump(model, "./location_model.joblib")

def predict_location(user_tweets):
    """Takes in a list of user tweets with created_at and returns a str predicting the location"""
    X = np.array(preprocess_new_data(user_tweets)).reshape(1, -1)  # single sample
    model = joblib.load("./location_model.joblib")
    return model.predict(X)

    
