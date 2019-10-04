# Lint as: python3

from __future__ import division
from __future__ import print_function

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score

CLEANED_TWEETS_FILENAME = "housing.csv.cleaned.txt"
CORE_WORDS = ['housing', 'san', 'francisco']

vectorizer = TfidfVectorizer(stop_words='english')

def kmean_cluster(words):
  X = vectorizer.fit_transform(words)
  true_k = 5
  model = KMeans(n_clusters=true_k, init='k-means++', max_iter=100, n_init=1)
  model.fit(X)

  print("Top terms per cluster:")
  order_centroids = model.cluster_centers_.argsort()[:, ::-1]
  terms = vectorizer.get_feature_names()
  for i in range(true_k):
    print("Cluster %d:" % i),
    for ind in order_centroids[i, :10]:
        print(' %s' % terms[ind]),
    print
  return model

def kmean_predict(model, tweet):
  print("Prediction")
  Y = vectorizer.transform(tweet)
  prediction = model.predict(Y)
  print(prediction)
  return prediction


def cluster_tweets():
  with open(CLEANED_TWEETS_FILENAME) as fp:
    tweets = fp.readlines()
    model = kmean_cluster(tweets)
    # prediction = kmean_predict(model, "san francisco housing policy renewed.")


def main():
  cluster_tweets()


if __name__ == '__main__':
  main()
