# The original tweets are downloaded from https://www.kaggle.com/kazanova/sentiment140/downloads/sentiment140.zip/2, then
# cat training.1600000.processed.noemoticon.csv | grep -i 'healthcare' > /tmp/healthcare
# to select these with key word healthcare.

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import pandas as pd
import numpy as np
import datetime
import sys
import codecs
import re
import itertools
import collections
import nltk  # Natural Language Processing
import os
import pickle

# nltk.download('punkt')
# nltk.download('all')

from nltk.stem.wordnet import WordNetLemmatizer
from nltk.corpus import stopwords  # list of words
from collections import Counter  # optimized way to do this
import string  # list(string.punctuation) - produces a list of punctuations
import copy
from itertools import product, tee, combinations, chain
from nltk.stem import PorterStemmer
from operator import itemgetter  # help with dataframes

from autocorrect import Speller

# tweet_raw: original tweet string(text)
#   returns a list of tokens.


def nlp(tweets_vector, cluster_list):
    emoticons_str = r"""
    (?:
    [:=;] # Eyes
    [oO\-]? # Nose (optional)
    [D\)\]\(\]/\\OpP] # Mouth
    )"""

    # Regex_str is used to GET text from CSV file
    regex_str = [
        r'<[^>]+>',  # HTML tags
        r'(?:@[\w_]+)',  # @-signs
        r"(?:\#+[\w_]+[\w\'_\-]*[\w_]+)",  # hash-tags
        # URLs
        r'http[s]?://(?:[a-z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-f][0-9a-f]))+',
        r'(?:(?:\d+,?)+(?:\.?\d+)?)',  # numbers
        r"(?:[a-z][a-z'\-_]+[a-z])",  # words with - and '
        r'(?:[\w_]+)'  # other words
    ]

    # These Regex are used to EXCLUDE items from the text AFTER IMPORTING from
    # csv with regex_str
    numbers = r'(?:(?:\d+,?)+(?:\.?\d+)?)'
    URL = r'http[s]?://(?:[a-z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-f][0-9a-f]))+'
    html_tag = r'<[^>]+>'
    hash_tag = r"(?:\#+[\w_]+[\w\'_\-]*[\w_]+)"
    at_sign = r'(?:@[\w_]+)'
    dash_quote = r"(?:[a-z][a-z'\-_]+[a-z])"
    other_word = r'(?:[\w_]+)'
    other_stuff = r'(?:\S)'  # anything else - NOT USED
    start_pound = r"([#?])(\w+)"  # Start with #
    start_quest_pound = r"(?:^|\s)([#?])(\w+)"  # Start with ? or with #
    cont_number = r'(\w*\d\w*)'  # Words containing numbers

    #      Remove '[' and ']' brackets
    sq_br_f = r'(?:[[\w_]+)'  # removes '['
    sq_br_b = r'(?:][\w_]+)'  # removes ']'

    rem_bracket = r'(' + '|'.join([sq_br_f, sq_br_b]) + ')'
    rem_bracketC = re.compile(rem_bracket, re.VERBOSE)

    # Removes all words of 3 characters or less ******************************
    short_words = r'\W*\b\w{1,3}\b'  # Short words of 3 character or less
    short_wordsC = re.compile(short_words, re.VERBOSE | re.IGNORECASE)

    # REGEX remove all words with \ and / combinations
    slash_back = r'\s*(?:[\w_]*\\(?:[\w_]*\\)*[\w_]*)'
    slash_fwd = r'\s*(?:[\w_]*/(?:[\w_]*/)*[\w_]*)'
    slash_all = r'\s*(?:[\w_]*[/\\](?:[\w_]*[/\\])*[\w_]*)'

    # REGEX numbers, short words and URL only to EXCLUDE +++++++++++++++++++++
    # Exclude from tweets
    num_url_short = r'(' + '|'.join([numbers, URL,
                                     short_words + sq_br_f + sq_br_b]) + ')'
    comp_num_url_short = re.compile(num_url_short, re.VERBOSE | re.IGNORECASE)

    # Master REGEX to INCLUDE from the original tweets +++++++++++++++++++++++
    list_regex = r'(' + '|'.join(regex_str) + ')'
    # TAKE from tweets INITIALLY
    master_regex = re.compile(list_regex, re.VERBOSE | re.IGNORECASE)

    def filterPick(tweets, filter):
        return [(l, m.group(1)) for l in tweets for m in (filter(l),) if m]

    search_regex = re.compile(list_regex, re.VERBOSE | re.IGNORECASE).search

    MIN_WORDS_PER_TWEET = 2

    # Use tweetList -  that is a list from DF (using .tolist())
    # It is a tuple: initial list from all tweets
    outlist_init = filterPick(tweets_vector.tolist(), search_regex)

    char_remove = [']', '[', '(', ')', '{', '}']  # characters to be removed
    emotion_list = [':)', ';)', '(:', '(;', '}', '{', '}']
    word_garb = [
        'thats',
        'youre',
        'thanks',
        'hasn',
        'https',
        'wanna',
        'gonna',
        'aint',
        'havent',
        'dont',
        'cant',
        'werent',
        'u',
        'isnt',
        'theyre',
        'shes',
        'youve',
        'youll',
        'weve',
        'theyve', 
        'amp',
        'doesnt', 
        'ive']

    exclude = list(string.punctuation) + emotion_list + word_garb

    # Convert tuple to a list, then to a string; Remove the characters; Stays
    # as a STRING. Porter Stemmer
    stemmer = PorterStemmer()
    lmtzr = WordNetLemmatizer()

    # Auto spelling corrector in python3
    spell = Speller(lang='en')

    # a list of list of tokens
    X = list()
    Y = list()
    counter = 1
    for i in range(len(outlist_init)):
        tweet = outlist_init[i]
        cluster = cluster_list[i]
        if counter % 100 == 0:
            print('Proccessed tweets:', counter)
        tw_clean = []
        tw_clean = [ch for ch in tweet if ch not in char_remove]
        tw_clean = re.sub(URL, "", str(tw_clean))
        tw_clean = re.sub(html_tag, "", str(tw_clean))
        tw_clean = re.sub(hash_tag, "", str(tw_clean))
        tw_clean = re.sub(slash_all, "", str(tw_clean))
        tw_clean = re.sub(cont_number, "", str(tw_clean))
        tw_clean = re.sub(numbers, "", str(tw_clean))
        tw_clean = re.sub(start_pound, "", str(tw_clean))
        tw_clean = re.sub(start_quest_pound, "", str(tw_clean))
        tw_clean = re.sub(at_sign, "", str(tw_clean))
        tw_clean = re.sub("'", "", str(tw_clean))
        tw_clean = re.sub('"', "", str(tw_clean))
        # Removes # and @ in words (lookahead)
        tw_clean = re.sub(r'(?:^|\s)[@#].*?(?=[,;:.!?]|\s|$)', r'', tw_clean)
        tw_clean = re.sub(r'/', r' ', tw_clean)
        tw_clean_lst = re.findall(r'\w+', str(tw_clean))

        tw_clean_lst = [word.lower() for word in tw_clean_lst if word not in exclude]

        # Keeps only nouns
        tw_clean_lst = [word[0] for word in nltk.pos_tag(tw_clean_lst) if
            word[1].startswith('N') or word[1].startswith('J')]
        
        # Lemma, stem
        tw_clean_lst = [lmtzr.lemmatize(word) for word in tw_clean_lst]
        tw_clean_lst = [stemmer.stem(word) for word in tw_clean_lst]
        tw_clean_lst = [spell(word) for word in tw_clean_lst]
        if len(tw_clean_lst) < MIN_WORDS_PER_TWEET:
          continue
        tw_clean_lst = [word for word in tw_clean_lst if len(word) > 2]
        tw_clean_lst = [word for word in tw_clean_lst if word not in stopwords.words('english')]
  
        #print("org tweet = ", tweet)
        #print("cleaned tweet = (", tw_clean_lst, ")")
        X.append(tw_clean_lst)
        Y.append(cluster)
        counter += 1
    
    return (X, Y)
    # end of nlp func


def read_csv():
    data = pd.read_csv(
        DATA_FILENAME,
        delimiter=',',
        names=[
            'sentiment',
            'id',
            'date',
            'query',
            'user',
            'tweet'])
    print("Read data stats: ", data.count())
    # print("Top data records")
    # print(data.head()[['tweet']])
    return data


# Words Replacement ******************************************************
def replace_all(text, dic):
    for i, j in dic.items():
        text = text.replace(i, j)
    return text


def read_tokenize_data(filename):
    df = pd.read_csv(filename)
    print('Columns=', list(df.columns))
    return nlp(df['text'], df['class'].tolist())


def main(data_filename=None):
    (X, Y) = read_tokenize_data(data_filename)
    # print(X)
    # print(Y)
    with open(os.path.join('data', 'X.pkl'), 'wb') as f:
        pickle.dump(X, f)
        print('Save X into X.pkl: dim1=', len(X), "dim2=", len(X[0]))
    with open(os.path.join('data', 'Y.pkl'), 'wb') as f:
        pickle.dump(Y, f)
        print('Save Y into Y.pkl: dim1=', len(Y))
    # end of main


if __name__ == '__main__':
    if len(sys.argv) < 2:
        raise Exception("{} data_file.csv.".format(sys.argv[0]))
    main(sys.argv[1])
