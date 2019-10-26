"""
Basic model for location algorithm
"""
import json

import numpy as np
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split, cross_validate
from sklearn.metrics import accuracy_score

# TODO:
# evaluate the geotagged locations against self-reported locations in user bio
# implement Ego Network

"""
Generate dummy data to build out pipeline
"""
LOCATIONS = ["San Francisco", "Chicago", "New York", "Atlanta", "Austin", "Portland", "Seattle", "Washington D.C."]


def random_time():
    hour = np.random.randint(0, 24)
    if hour < 10:
        hour = "0"+str(hour)
    minute = np.random.randint(0, 60)
    if minute < 10:
        minute = "0"+str(minute)
    time_ = str(hour) + ":" + str(minute)

    return "2015-03-23T"+time_


def create_dummy_data(num_users, num_tweets, locations=LOCATIONS):
    users = []
    for i in range(num_users):
        # generate random tweets
        user_tweets = list()
        for j in range(num_tweets):
            user_tweets.append({"tweet_id": str(j), "tweet_time": random_time()})
        location = locations[np.random.randint(0, len(locations))]
        users.append({"user_id": str(i), "location": location, "user_tweets": user_tweets})
    dummy_json = json.dumps(users)
    return json.loads(dummy_json)


def get_labels_and_features(data, fractional=True):
    labels = dict()
    user_tweet_times = dict()

    for user in data:
        id_ = user['user_id']
        labels[id_] = user['location']

        hourly_buckets = {k: 0 for k in range(0, 24)}
        for t in user['user_tweets']:
            hour = int(t["tweet_time"].split("T")[1].split(':')[0])
            hourly_buckets[hour] += 1
        if fractional:
            total_tweets = sum(hourly_buckets.values())
            hourly_buckets = {k: x/total_tweets for k, x in hourly_buckets.items()}
        user_tweet_times[id_] = hourly_buckets

    return labels, user_tweet_times


def basic_model(num_users, num_tweets):
    """Will remove parameters and replace with real data as input"""
    # pull a set of users that have geolocation enabled
    # hit the Search API for tweets from users in [50 metro areas]
    # dummy simulates the complete data set
    dummy_data = create_dummy_data(num_users, num_tweets)
    # labels are user_id mapped to location names
    # features are user_id mapped to 0-24 hourly percentages of tweets
    labels, features = get_labels_and_features(dummy_data)

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
