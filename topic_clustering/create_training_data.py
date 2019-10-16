# Lint as: python3

from __future__ import division
from __future__ import print_function

import os
import sys
import numpy
import glob
import pandas

from pandas import DataFrame
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

NEWLINE = '\n'

CURRENT_DIR = '/Users/annesijieyu/Downloads'

# These are the paths for training data
SOURCES = [
    ('Tweet-Classifier/Data/train/politics', 'Politics'),
    ('Tweet-Classifier/Data/train/sports', 'Sports'),
    ('Tweet-Classifier/Data/train/education', 'Education'),
    ('Tweet-Classifier/Data/train/entertainment', 'Entertainment'),
    ('Tweet-Classifier/Data/train/health', 'Health'),
    ('Tweet-Classifier/Data/train/nature', 'Nature'),
    ('Tweet-Classifier/Data/train/startups', 'Startups'),
    ('Tweet-Classifier/Data/train/business', 'Business'),
    ('Tweet-Classifier/Data/train/news', 'News'),
]

# This function reads the content from the specified path and puts them in
# a list


def read_files(path):
    os.chdir(path)  # changes the current dir to this
    for filename in glob.glob('*.txt'):
        with open(filename, 'r') as f:
            lines = f.readlines()
        content = ' '.join(lines)
        yield filename, content


# By using Pandas library,this function builds a DataFrame in a format
# that can be used as an input to the classifier
def build_data_frame(path, classification):
    rows = []
    index = []
    counter = 0
    for file_name, text in read_files(path):
        if counter == 10:
            print('processed files', counter)
        counter = counter + 1
        rows.append({'text': text, 'class': classification})
        index.append(file_name)
        print("Read from=", file_name, ", classification=", classification)
    data_frame = DataFrame(rows, index=index)
    return data_frame


# Get Training Data from the input file
def get_training_data(data_dir=None):
    data = DataFrame({'text': [], 'class': []})
    for path, classification in SOURCES:
        full_path = os.path.join(CURRENT_DIR, path)
        data = data.append(build_data_frame(full_path, classification))
    print("Finished reading training data.")
    print(data.head())
    return data
    # end of get_training_data


def main(training_data_dir=None):
    # Step 1, get training dataframe
    curr_dir = os.path.dirname(os.getcwd())
    training_df = get_training_data(training_data_dir)
    os.chdir(curr_dir)
    training_df.to_csv(r'training.csv')
    print("Write training data into ", str(curr_dir), "/training.csv")
    # end of main


if __name__ == '__main__':
    # if len(sys.argv) < 2:
    #  raise Exception("classification.py labelled_tlabelled_tweet_pathh")
    # main(sys.argv[1])
    main()
