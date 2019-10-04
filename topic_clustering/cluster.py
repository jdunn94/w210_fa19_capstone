# Lint as: python3

from __future__ import division
from __future__ import print_function

import sys

TOPICS = {
    "news_trend" : ["news", "lottery", "crisis", "new", "construction", "project"],
    "housing_hunting" : ["find", "found", "looking", "looked", "search", "hunt", "lock"],
    "government" : ["government", "policy", "policies", "school", "schools", "community", 
                    "communities", "program", "stratety", "plan", "tax", "credit",
                    "association", "associations", "act", "sector", "politician",
                    "politicians", "state", "states", "country", "american", "america"
                    ],
    "technology" : ["application", "web", "site", "sites", "innovative", "technology",
                    "technologies"
                    ],
    "business" : ["market", "recovery", "interests", "estate", "market", "rates",
                  "rate", "price", "buyer", "sale", "trade", "economic", "expensive",
                  "corporate", "sales", "economy"],
    "personal" : ["clearning", "clean", "remodel", "paint", "decor", "paint",
                  "maintain", "moving", "design"],
    "research" : ["research", "project", "forum", "talk", "speech", "conference", "workshop"],
    "affordable_housing" : ["affordable", "low-cost", "cheap", "cheaper"],
    "rent" : ["rent", "rental", "renting", "aford", "control"],
    "homeless" : ["homeless", "homelessness", "thrive"],
    "random" : [""]
}

def similarity(tweet):
  out_list_w = tweet.split(" ")
  if len(out_list_w) <= 2:
    return("random", 0)
  # Jaccard Similarity
  a = set(out_list_w)
  max_score = 0
  cluster = "random"
  for topic in TOPICS:
    b = set(TOPICS[topic])
    c = a.intersection(b)
    score = float(len(c) / (len(a) + len(b) - len(c)))
    if score > max_score:
      cluster = topic
      max_score = score
  return (cluster, max_score)
  #end of cluster func


def read_process_tweets(tweet_filename):
  output_file = open("similarity.csv", "w")
  with open(tweet_filename) as fp:
    for line in fp:
      cols = line.split(",")
      tweet = cols[2].strip()
      (cluster, score) = similarity(tweet)
      output_file.write("{},{},{},{},{}\n".format(cols[0],cluster,score,tweet,cols[1]))
  output_file.close()
  print("\r\n!!Write similarity score and cluster into similarity.csv.")

def main(argv):
  if len(argv) < 2:
    raise Exception('cluster.py filename.')
  read_process_tweets(argv[1])

if __name__ == '__main__':
  main(sys.argv)
