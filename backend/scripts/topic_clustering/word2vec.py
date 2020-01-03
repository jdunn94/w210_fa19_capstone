# Read X.pkl and Y.pkl from data folder then create word2vec model.
import gensim
import os
import pickle
import sys
import numpy as np

from collections import defaultdict
from sklearn.pipeline import Pipeline
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import cross_val_score
from itertools import islice
from sklearn.svm import SVC
from sklearn.manifold import TSNE

import matplotlib.pyplot as plt
import matplotlib.cm as cm

DIM_SIZE_OF_WORD2VEC = 100


class MeanEmbeddingVectorizer(object):
    def __init__(self, word2vec):
        self.word2vec = word2vec
        if len(word2vec) > 0:
            self.dim = DIM_SIZE_OF_WORD2VEC
        else:
            self.dim = 0

    def fit(self, X, y):
        return self

    def transform(self, X):
        return np.array([
            np.mean([self.word2vec[w] for w in words if w in self.word2vec]
                    or [np.zeros(self.dim)], axis=0)
            for words in X
        ])
    # end of MeanEmbeddingVectorizer

# and a tf-idf version of the same


class TfidfEmbeddingVectorizer(object):
    def __init__(self, word2vec):
        self.word2vec = word2vec
        self.word2weight = None
        if len(word2vec) > 0:
            self.dim = DIM_SIZE_OF_WORD2VEC
        else:
            self.dim = 0

    def fit(self, X, y):
        tfidf = TfidfVectorizer(analyzer=lambda x: x)
        tfidf.fit(X)
        # if a word was never seen - it must be at least as infrequent
        # as any of the known words - so the default idf is the max of
        # known idf's
        max_idf = max(tfidf.idf_)
        self.word2weight = defaultdict(
            lambda: max_idf,
            [(w, tfidf.idf_[i]) for w, i in tfidf.vocabulary_.items()])

        return self

    def transform(self, X):
        return np.array([
            np.mean([self.word2vec[w] * self.word2weight[w]
                     for w in words if w in self.word2vec] or
                    [np.zeros(self.dim)], axis=0)
            for words in X
        ])
    # end of TfidfEmbeddingVectorizer


KEY_WORDS = ['homelessness']


def word2vec(X, y):
    # let X be a list of tokenized texts (i.e. list of lists of tokens)
    model = gensim.models.Word2Vec(
        X, size=10, window=5, min_count=1, workers=2)
    model.init_sims(replace=True)
    model.save(os.path.join('topic_clustering/data', 'w2v.model'))
    print('Save word2vec to w2v.model')

    for key in KEY_WORDS:
        try:
            print(key, ' similar words:',
                  model.wv.most_similar_cosmul(positive=[key], topn=20))
        except BaseException:
            print('No such keyword:', key)

    #print(list(islice(model.wv.vocab, 1, 10)))
    # estimate the accuracy
    # w2v = {w: vec for w, vec in zip(model.wv.index2word, model.wv.vectors)}
    w2v = {w: vec for w, vec in zip(model.wv.index2word, model.wv.vectors)}

    # Pipeline 1 using tree
    tree_w2v_tfidf = Pipeline([
        ("word2vec vectorizer", TfidfEmbeddingVectorizer(w2v)),
        ("extra trees", ExtraTreesClassifier(n_estimators=200))])
    scores = cross_val_score(tree_w2v_tfidf, X, y, cv=5)
    print("tree_w2v_tfidf acc=", scores)

    # Pipeline 2
    # svc_tfidf = Pipeline([("tfidf_vectorizer", TfidfVectorizer(
    #    analyzer=lambda x: x)), ("linear svc", SVC(kernel="linear"))])
    #scores = cross_val_score(svc_tfidf, X, y, cv=5)
    #print("svc_tfidf acc=", scores)

    return (model, list(model.wv.vocab))
    # end of func


def tsne_plot_similar_words(model, filename='word2vec'):
    embedding_clusters = []
    word_clusters = []
    for word in KEY_WORDS:
        embeddings = []
        words = []
        try:
            for similar_word, _ in model.wv.most_similar(word, topn=30):
                words.append(similar_word)
                embeddings.append(model[similar_word])
                # print(embeddings)
            embedding_clusters.append(embeddings)
            word_clusters.append(words)
        except BaseException:
            print(word, ' not in the vocab.')

    if len(word_clusters) == 0 or len(embedding_clusters) == 0:
      print('No similar words are found for any topics')
      return

    tsne_model_en_2d = TSNE(
        perplexity=15,
        n_components=2,
        init='pca',
        n_iter=3500,
        random_state=32)
    embedding_clusters = np.array(embedding_clusters)
    n, m, k = embedding_clusters.shape
    embeddings_en_2d = np.array(
        tsne_model_en_2d.fit_transform(
            embedding_clusters.reshape(
                n * m,
                k))).reshape(
        n,
        m,
        2)

    plt.figure(figsize=(16, 9))
    colors = cm.rainbow(np.linspace(0, 1, len(KEY_WORDS)))
    for label, embeddings, words, color in zip(
            KEY_WORDS, embeddings_en_2d, word_clusters, colors):
        print(len(embeddings))
        x = embeddings[:, 0]
        y = embeddings[:, 1]
        plt.scatter(x, y, c=color, alpha=0.7, label=label)
        for i, word in enumerate(words):
            plt.annotate(
                word, alpha=0.5, xy=(
                    x[i], y[i]), xytext=(
                    5, 2), textcoords='offset points', ha='right', va='bottom', size=8)
    plt.legend(loc=4)
    plt.title("word2vec")
    plt.grid(True)
    if filename:
        plt.savefig(filename, format='png', dpi=150, bbox_inches='tight')
    plt.show()


def main(X_filename=None, Y_filename=None):
    if X_filename is None:
        X_filename = os.path.join('topic_clustering/data', 'X.pkl')
    if Y_filename is None:
        Y_filename = os.path.join('topic_clustering/data', 'Y.pkl')
    with open(X_filename, 'rb') as f:
        X1 = pickle.load(f)
    with open(Y_filename, 'rb') as f:
        Y1 = pickle.load(f)
    if (len(X1) != len(Y1)):
        raise Exception('Dim of X is different from dim of Y:', len(X1), ',',
                        len(Y1))
    # remove empty sentence
    X = list()
    Y = list()
    for i in range(len(X1)):
        if X1[i] != []:
            X.append(X1[i])
            Y.append(Y1[i])
    # print(Y)
    print('X dim=(', len(X), ',', len(X[0]), '),type=', type(
        Y), 'Y dim=', len(Y), 'type=', type(Y))
    (w2v, words) = word2vec(X, Y)
    with open(os.path.join('topic_clustering/data', 'words.pkl'), 'wb') as f:
        pickle.dump(words, f)
        print('Dump words to words.pkl: dim=', len(words))
    tsne_plot_similar_words(model=w2v, filename='word2vec')
    # end of main


if __name__ == '__main__':
    # if len(sys.argv) < 3:
    #    raise Exception("{} X.pkl Y.pkl".format(sys.argv[0]))
    # main(sys.arg[1], sys.argv[2])
    main()
