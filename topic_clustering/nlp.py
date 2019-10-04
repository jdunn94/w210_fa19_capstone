#The original tweets are downloaded from https://www.kaggle.com/kazanova/sentiment140/downloads/sentiment140.zip/2, then
#cat training.1600000.processed.noemoticon.csv | grep -i 'healthcare' > /tmp/healthcare
#to select these with key word healthcare.

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import pandas as pd
import numpy as np
import datetime
import sys
import codecs
import re
import itertools, collections

import nltk  # Natural Language Processing

#nltk.download('punkt')
#nltk.download('all')

from nltk.stem.wordnet import WordNetLemmatizer
from nltk.corpus import stopwords # list of words
from collections import Counter  # optimized way to do this
import string  # list(string.punctuation) - produces a list of punctuations
import copy
from itertools import product, tee, combinations, chain
from nltk.stem import PorterStemmer
from operator import itemgetter # help with dataframes

from autocorrect import Speller

OUTPUT_FILE = open("cleaned_tweets.csv", "w")
WORDS_KEEP = ['housing', 'san', 'francisco', 'house', 'building',
              'apartment', 'home', 'residence', 'dwelling', 'accommodation',
              'place', 'habitation', 'abode', 'domicile', 'living']

def nlp(tweet_list_org):
  emoticons_str = r"""
  (?:
  [:=;] # Eyes
  [oO\-]? # Nose (optional)
  [D\)\]\(\]/\\OpP] # Mouth
  )"""

  # Regex_str is used to GET text from CSV file
  regex_str = [
    r'<[^>]+>', # HTML tags
    r'(?:@[\w_]+)', # @-signs
    r"(?:\#+[\w_]+[\w\'_\-]*[\w_]+)", # hash-tags
    r'http[s]?://(?:[a-z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-f][0-9a-f]))+', # URLs
    r'(?:(?:\d+,?)+(?:\.?\d+)?)', # numbers
    r"(?:[a-z][a-z'\-_]+[a-z])", # words with - and '
    r'(?:[\w_]+)' # other words
  ]

  # These Regex are used to EXCLUDE items from the text AFTER IMPORTING from csv with regex_str
  numbers = r'(?:(?:\d+,?)+(?:\.?\d+)?)'
  URL = r'http[s]?://(?:[a-z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-f][0-9a-f]))+'
  html_tag = r'<[^>]+>'
  hash_tag = r"(?:\#+[\w_]+[\w\'_\-]*[\w_]+)"
  at_sign = r'(?:@[\w_]+)'
  dash_quote = r"(?:[a-z][a-z'\-_]+[a-z])"
  other_word = r'(?:[\w_]+)'
  other_stuff = r'(?:\S)' # anything else - NOT USED
  start_pound = r"([#?])(\w+)" # Start with #
  start_quest_pound = r"(?:^|\s)([?])(\w+)" # Start with ?
  cont_number = r'(\w*\d\w*)' # Words containing numbers

  #      Remove '[' and ']' brackets
  sq_br_f = r'(?:[[\w_]+)' # removes '['
  sq_br_b = r'(?:][\w_]+)' # removes ']'

  rem_bracket = r'(' + '|'.join([sq_br_f, sq_br_b]) +')'
  rem_bracketC = re.compile(rem_bracket, re.VERBOSE)

  # Removes all words of 3 characters or less *****************************************************
  short_words = r'\W*\b\w{1,3}\b' # Short words of 3 character or less
  short_wordsC = re.compile(short_words, re.VERBOSE | re.IGNORECASE)

  # REGEX remove all words with \ and / combinations
  slash_back =  r'\s*(?:[\w_]*\\(?:[\w_]*\\)*[\w_]*)'
  slash_fwd = r'\s*(?:[\w_]*/(?:[\w_]*/)*[\w_]*)'
  slash_all = r'\s*(?:[\w_]*[/\\](?:[\w_]*[/\\])*[\w_]*)'

  # REGEX numbers, short words and URL only to EXCLUDE +++++++++++++++++++++++++++++++++++++++++++++++++++
  num_url_short = r'(' + '|'.join([numbers, URL, short_words + sq_br_f + sq_br_b]) +')'  # Exclude from tweets
  comp_num_url_short = re.compile(num_url_short, re.VERBOSE | re.IGNORECASE)

  # Master REGEX to INCLUDE from the original tweets ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  list_regex = r'(' + '|'.join(regex_str) + ')'
  master_regex = re.compile(list_regex, re.VERBOSE | re.IGNORECASE) # TAKE from tweets INITIALLY

  # Filters IMPORTED from csv file data
  def filterPick(list, filter):
    return [ ( l, m.group(1) ) for l in list for m in (filter(l),) if m]

  search_regex = re.compile(list_regex, re.VERBOSE | re.IGNORECASE).search

  MIN_WORDS_PER_TWEET = 2

  # Use tweetList -  that is a list from DF (using .tolist())
  outlist_init = filterPick(tweet_list_org, search_regex) # It is a tuple: initial list from all tweets
  char_remove = ['#', ']', '[', '(', ')', '{', '}'] # characters to be removed
  emotion_list = [':)', ';)', '(:', '(;', '}', '{','}']
  word_garb = ['here', 'there', 'where', 'when', 'would', 'should', 'could','thats', 'youre', 'thanks', 'hasn',\
               'thank', 'https', 'since', 'wanna', 'gonna', 'aint', 'http', 'unto', 'onto', 'into', 'havent',\
               'dont', 'done', 'cant', 'werent', 'https', 'u', 'isnt', 'go', 'theyre', 'each', 'every', 'shes', 'youve', 'youll',\
               'weve', 'theyve']

  # Dictionary with Replacement Pairs ******************************************************************************
  exclude = list(string.punctuation) + emotion_list + word_garb

  # Convert tuple to a list, then to a string; Remove the characters; Stays as a STRING. Porter Stemmer
  stemmer=PorterStemmer()
  lmtzr = WordNetLemmatizer()

  # Auto spelling corrector in python3
  spell = Speller(lang='en')

  counter = 1
  for tweet in outlist_init:
    tw_clean = []
    tw_clean = [ch for ch in tweet if ch not in char_remove]
    tw_clean = re.sub(URL, "", str(tw_clean))
    tw_clean = re.sub(html_tag, "",str(tw_clean))
    #tw_clean = re.sub(hash_tag, "",str(tw_clean))
    tw_clean = re.sub(slash_all,"", str(tw_clean))
    tw_clean = re.sub(cont_number, "",str(tw_clean))
    tw_clean = re.sub(numbers, "",str(tw_clean))
    #tw_clean = re.sub(start_pound, "",str(tw_clean))
    tw_clean = re.sub(start_quest_pound, "",str(tw_clean))
    tw_clean = re.sub(at_sign, "",str(tw_clean))
    tw_clean = re.sub("'", "",str(tw_clean))
    tw_clean = re.sub('"', "",str(tw_clean))
    tw_clean = re.sub(r'(?:^|\s)[@].*?(?=[,;:.!?]|\s|$)', r'', tw_clean) # Removes # and @ in words (lookahead)
    tw_clean = lmtzr.lemmatize(str(tw_clean))
    tw_clean = stemmer.stem(str(tw_clean))
    tw_clean_lst = re.findall(r'\w+', str(tw_clean))
    tw_clean_lst = [tw.lower() for tw in tw_clean_lst if tw.lower() not in stopwords.words('english')]
    tw_clean_lst = [word for word in tw_clean_lst if word not in exclude]
    tw_clean_lst = str([word for word in tw_clean_lst if len(word)>MIN_WORDS_PER_TWEET or word.lower() in WORDS_KEEP])
    tw_clean_lst = re.findall(r'\w+', str(tw_clean_lst))
    #valid_words = [word for word in WORDS_KEEP if word in tw_clean_lst]
    #if len(valid_words) == 0:
    #    continue
    if len(tw_clean_lst) < MIN_WORDS_PER_TWEET:
      continue
    #print("org tweet = ", tweet)
    tw_clean_str = spell(" ".join(tw_clean_lst))
    #print("cleaned tweet = (", tw_clean_str, ")")
    #print("=" * 70)
    cleaned_tw = re.sub(r",", " ", tweet)
    OUTPUT_FILE.write("{},{},{}\n".format(counter, cleaned_tw, tw_clean_str))
    counter = counter + 1
  print("Write cleaned tweets into cleaned_tweets.csv.\r\n")
  # end of nlp func

def read_csv():
  data = pd.read_csv(DATA_FILENAME, delimiter=',', names=['sentiment', 'id', 'date', 'query', 'user', 'tweet'])
  print("Read data stats: ", data.count())
  #print("Top data records")
  #print(data.head()[['tweet']])
  return data

def read_tweets_from_txt(file_name):
  with open(file_name) as f:
    return f.readlines()


# Words Replacement ***************************************************************************************
def replace_all(text, dic):
    for i, j in dic.items():
        text = text.replace(i, j)
    return text

def main():
  if len(sys.argv) < 2:
    raise Exception('nlp.py file_name.')
  #data = read_csv()
  #tweet_list_org = data.tweet # convert DF to list (tweets only) NOT a nested list
  tweet_list_org = read_tweets_from_txt(sys.argv[1])
  nlp(tweet_list_org)

if __name__ == '__main__':
  main()
