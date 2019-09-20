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

import pandas as pd

LANGUAGE = "english"

def nlp(data):
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
  data = pd.read_csv("healthcare.csv", delimiter=',', names=['sentiment', 'id', 'date', 'query', 'user', 'tweet'])
  print("Read data:", data.count())
  print("Top data records")
  print(data.head()[['tweet']])
  return data

def main():
  #if len(argv) > 1:
  #  raise app.UsageError('Too many command-line arguments.')
  data = read_data()
  nlp(data)

if __name__ == '__main__':
  main()
