# Graph Exploration
import operator
import time

from infomap import Infomap
import networkx as nx
import numpy as np
import pandas as pd


def load_data():
    # Local version of ASU social graph
    twitter_nodes = pd.read_csv('./code/data/Twitter-dataset/data/nodes.csv', header=None)
    twitter_edges = pd.read_csv('./code/data/Twitter-dataset/data/edges.csv', header=None)
    # let's take a random sample of twitter_edges to make it a bit smaller
    sampled_twitter_edges = twitter_edges.sample(frac=0.01)
    return sampled_twitter_edges


def create_graph(df_edges):
    G = nx.DiGraph()
    G.add_edges_from(df_edges.values.tolist())
    print(f'Number of nodes: {len(list(G.nodes))}')
    in_degrees = dict(G.in_degree)
    print(f'Largest number of connections: {max(in_degrees.values())}')
    return G


def findCommunities(G):
    """Partition network with infomap algorithm
    Annotates node with community_id and returns number of communities found"""
    infomapWrapper = Infomap("--two-level")
    print("Building Infomap network from a NetworkX graph...")
    for e in G.edges():
        infomapWrapper.addLink(*e)
    print("Find communities with Infomap...")
    infomapWrapper.run()
    print("Found %d top modules with codelength: %f" % (infomapWrapper.numTopModules(), infomapWrapper.codelength()))
    communities = {}
    for node in infomapWrapper.iterTree():
        if node.isLeaf():
            communities[node.physicalId] = node.moduleIndex()
    nx.set_node_attributes(G, name='community', values=communities)
    return infomapWrapper.numTopModules()


startTime = time.time()
df_edges = load_data()
print(time.time() - startTime)  # 39.27s to load ~2GB csv
startTime = time.time()
G = create_graph(df_edges)
print(time.time() - startTime)  # 9.04s to create 1% subset graph, n = 583811 with largest connections = 5704
startTime = time.time()
num_modules = findCommunities(G)  # Found 28081 top modules with codelength: 9.121715
print('Approximate number of communities: ', 583811//num_modules)
print(1000* (time.time() - startTime) / 583811, 'ms per node')  # 0.05ms per node to run InfoMap