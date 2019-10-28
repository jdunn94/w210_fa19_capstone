# This is a module for "Topic Model"

import numpy as np
import os
import re

from autocorrect import Speller
from gensim.models import Word2Vec
from nlp import nlp
from nltk.stem.wordnet import WordNetLemmatizer


MIN_NUMBER_OF_TOPICS = 20
PRE_DEFINED_TOPICS = set({"homeless", "homelessness"})


def process_topics(topics):
    cleaned_topics = []
    lmtzr = WordNetLemmatizer()
    # Auto spelling corrector in python3
    spell = Speller(lang='en')
    for topic in topics:
        s = topic.lower()
        s = re.sub(r'(?:^|\s)[@#].*?(?=[,;:.!?]|\s|$)', r'', s)
        s = lmtzr.lemmatize(topic)
        s = spell(s)
        cleaned_topics.append(s)
    return cleaned_topics


def select_topics(topics, model):
    similar = list()
    for topn in range(10, 1000, 10):
        #print('Find similar words:', topn)
        words = model.wv.most_similar(positive=topics, topn=topn)
        set1 = set([w[0] for w in words])
        # print(set1)
        similar = set1.intersection(PRE_DEFINED_TOPICS)
        if len(similar) >= MIN_NUMBER_OF_TOPICS:
            return similar
    if len(similar) > 2:
        return similar
    print(
        "Fail to get enough interaction topics, fall back to generic similar words: ",
        MIN_NUMBER_OF_TOPICS)
    return model.wv.most_similar(positive=topics, topn=MIN_NUMBER_OF_TOPICS)

# This function gets a list of topics <str> that we have in our database,
# key-value structure of {key=topic, value = list of other topics sorted
# by similarity descending}


def find_similar_topics(topics):
    if len(topics) == 0:
        raise Exception('Input an empty topics list.')
    cleaned_topics = process_topics(topics)
    print(cleaned_topics)
    model = Word2Vec.load(os.path.join('data', 'w2v.model'))
    similar_topics = select_topics(topics, model)
    return similar_topics


def main(data_filename=None):
    similar_topics = find_similar_topics(['homelessness', 'homeless'])
    print(similar_topics)
    # end of main


if __name__ == '__main__':
    main()
