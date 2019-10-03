#The original tweets are downloaded from https://www.kaggle.com/kazanova/sentiment140/downloads/sentiment140.zip/2, then
#cat training.1600000.processed.noemoticon.csv | grep -i 'healthcare' > /tmp/healthcare
#to select these with key word healthcare.

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from sumy.parsers.html import HtmlParser
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
from sumy.summarizers.luhn import LuhnSummarizer
from sumy.summarizers.edmundson import EdmundsonSummarizer

from nltk.stem.wordnet import WordNetLemmatizer
from nltk.stem import PorterStemmer
from nltk.corpus import stopwords

import pandas as pd

DATA_FILENAME = "housing.csv"
LANGUAGE = "english"

def summarize(data):
  summarizer = EdmundsonSummarizer()

  words = ("healthcare")
  summarizer.bonus_words = words

  #words = ("another", "and", "some", "next", "i", "did")
  summarizer.stigma_words = get_stop_words(LANGUAGE)

  #words = ("another", "and", "some", "next", "i", "did")
  summarizer.null_words = get_stop_words(LANGUAGE)

  SENTENCES_COUNT = 1

  print("summarization:")
  for tweet in data.tweet:
    parser = PlaintextParser(tweet, Tokenizer(LANGUAGE))
    sum = summarizer(parser.document, SENTENCES_COUNT)
    print("tweet:\n", tweet, "\n")
    print("summary:")
    for sentence in sum:
      print(sentence, "\n")
    print("\n")

def read_data():
  data = pd.read_csv(DATA_FILENAME, delimiter=',', names=['sentiment', 'id', 'date', 'query', 'user', 'tweet'])
  print("Read data:", data.count())
  print("Top data records")
  print(data.head()[['tweet']])
  return data


def nlp(data):
  tweet_list_org = data.tweet.tolist()
  # Regex from Gagan ************************************************************
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
  start_quest_pound = r"(?:^|\s)([#?])(\w+)" # Start with ? or with #
  cont_number = r'(\w*\d\w*)' # Words containing numbers
 
  # My REGEX **************************************************************************
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

  # Use tweetList -  that is a list from DF (using .tolist())

  outlist_init = filterPick(tweet_list_org, search_regex) # It is a tuple: initial list from all tweets

  char_remove = [']', '[', '(', ')', '{', '}'] # characters to be removed
  words_keep = ['old', 'new', 'age', 'lot', 'bag', 'top', 'cat', 'bat', 'sap', 'jda', 'tea', 'dog', 'lie', 'law', 'lab','mob', 'map', 'car', 'fat', 'sea', 'saw', 'raw', 'rob', 'win', 'can', 'get', 'fan', 'fun', 'big','use', 'pea', 'pit','pot', 'pat', 'ear', 'eye', 'kit', 'pot', 'pen', 'bud', 'bet', 'god', 'tax', 'won', 'run','lid', 'log', 'pr', 'pd', 'cop', 'nyc', 'ny', 'la', 'toy', 'war', 'law', 'lax', 'jfk', 'fed', 'cry', 'ceo','pay', 'pet', 'fan', 'fun', 'usd', 'rio']
  emotion_list = [':)', ';)', '(:', '(;', '}', '{','}']
  word_garb = ['here', 'there', 'where', 'when', 'would', 'should', 'could','thats', 'youre', 'thanks', 'hasn','thank', 'https', 'since', 'wanna', 'gonna', 'aint', 'http', 'unto', 'onto', 'into', 'havent','dont', 'done', 'cant', 'werent', 'https', 'u', 'isnt', 'go', 'theyre', 'each', 'every', 'shes', 'youve', 'youll','weve', 'theyve']
  
  # Dictionary with Replacement Pairs ******************************************************************************
  repl_dict = {'googleele': 'goog', 'lyin': 'lie', 'googles': 'goog', 'aapl':'apple',\
             'msft':'microsoft', 'google': 'goog', 'googl':'goog'}

  exclude = list(string.punctuation) + emotion_list + word_garb

  # Convert tuple to a list, then to a string; Remove the characters; Stays as a STRING. Porter Stemmer

  stemmer=PorterStemmer()
  lmtzr = WordNetLemmatizer()

  # Convert tuple to a list, then to a string; Remove the characters; Stays as a STRING. Porter Stemmer

  # Preparing CLEAN tweets tp keep SEPARATELY from WORDS in TWEETS
  
  tweet_clean_fin = [] # Cleaned Tweets - Final Version
  for tweet in outlist_init:
    tw_clean = []
    tw_clean = [ch for ch in tweet if ch not in char_remove]

    tw_clean = re.sub(URL, "", str(tw_clean))
    tw_clean = re.sub(html_tag, "",str(tw_clean))
    tw_clean = re.sub(hash_tag, "",str(tw_clean))
    tw_clean = re.sub(slash_all,"", str(tw_clean))
    tw_clean = re.sub(cont_number, "",str(tw_clean))
    tw_clean = re.sub(numbers, "",str(tw_clean))
    tw_clean = re.sub(start_pound, "",str(tw_clean))
    tw_clean = re.sub(start_quest_pound, "",str(tw_clean))
    tw_clean = re.sub(at_sign, "",str(tw_clean))
    tw_clean = re.sub("'", "",str(tw_clean))
    tw_clean = re.sub('"', "",str(tw_clean))
    tw_clean = re.sub(r'(?:^|\s)[@#].*?(?=[,;:.!?]|\s|$)', r'', tw_clean) # Removes # and @ in words (lookahead)

    tw_clean = lmtzr.lemmatize(str(tw_clean))
    #tw_clean = stemmer.stem(str(tw_clean))

    tw_clean_lst = re.findall(r'\w+', str(tw_clean))

    tw_clean_lst = [tw.lower() for tw in tw_clean_lst if tw.lower() not in stopwords.words('english')]
    tw_clean_lst = [word for word in tw_clean_lst if word not in exclude]
    tw_clean_lst = str([word for word in tw_clean_lst if len(word)>3 or word.lower() in words_keep])

    tw_clean_lst = re.findall(r'\w+', str(tw_clean_lst))
    tw_clean_lst = [replace_all(word, repl_dict) for word in tw_clean_lst]

    tweet_clean_fin.append(list(tw_clean_lst))
    
  # Delete various elements from the text (LIST OF WORDS)
  out_list_fin = []
  out_string_temp = ''.join([ch for ch in str(list(outlist_init)) if ch not in char_remove])
  out_string_temp = re.sub(URL, "", out_string_temp)
  out_string_temp = re.sub(html_tag, "", out_string_temp)
  out_string_temp = re.sub(hash_tag, "", out_string_temp)
  out_string_temp = re.sub(slash_all,"", str(out_string_temp))
  out_string_temp = re.sub(cont_number, "", out_string_temp)
  out_string_temp = re.sub(numbers, "", out_string_temp)
  out_string_temp = re.sub(start_pound, "", out_string_temp)
  out_string_temp = re.sub(start_quest_pound, "", out_string_temp)
  out_string_temp = re.sub(at_sign, "", out_string_temp)
  out_string_temp = re.sub("'", "", out_string_temp)
  out_string_temp = re.sub('"', "", out_string_temp)
  out_string_temp = re.sub(r'(?:^|\s)[@#].*?(?=[,;:.!?]|\s|$)', r'', out_string_temp) # Removes # and @ in words (lookahead)

  out_list_w = re.findall(r'\w+', out_string_temp)
  out_string_short = str([word.lower() for word in out_list_w if len(word)>3 or word.lower() in words_keep]
  out_list_w = re.findall(r'\w+', out_string_short)
  out_list_w = [lmtzr.lemmatize(word) for word in out_list_w]
  #out_list_w = [stemmer.stem(word) for word in out_list_w]
  out_list_w = [word.lower() for word in out_list_w if word.lower() not in stopwords.words('english')]  # Remove stopwords
  out_list_w = str([word.lower() for word in out_list_w if word not in exclude])
  out_string_rpl = replace_all(out_list_w, repl_dict) # replace all words from dictionary

  # Convert "Cleaned" STRING to a LIST
  out_list_fin = re.findall(r'\w+', out_string_rpl)
  list_len = len(out_list_fin)
  word_list = set(out_list_fin) # list of unique words from all tweets - SET
  word_list_len = len(word_list)

  print "Set = ", word_list_len, "Original Qty = ", list_len
  print word_list
  print '********************************************************************************************************'
  print tweet_clean_fin
  print len(tweet_clean_fin)

  
def main():
  #if len(argv) > 1:
  #  raise app.UsageError('Too many command-line arguments.')
  data = read_data()
  #summarize(data)

if __name__ == '__main__':
  main()
