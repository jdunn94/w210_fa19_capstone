# TODO: Create new user personas and integrate them into pipeline
# TODO: Update write and read functions for persona.txt files in the models/ S3 bucket
# TODO: Update front end queries to include persona attribute

from infomap import Infomap
import networkx as nx
import numpy as np
from scipy.stats import zscore

from datastorage import AWSWriter


PERSONAS = ["leader", "content_creator", "amplifier", "watchdog"]


class IDMapper:
    """Responsible for remapping Twitter User ID's to be within native C int literal limit"""
    def __init__(self):
        """Constructor for ID Mapper"""
        self.map = dict()
        self.ids = list()

    def __getitem__(self, item):
        """Override magic method to map entries, creating new ones that don't already exist"""
        if item not in self.map:
            self.map[item] = len(self.ids) + 1
            self.ids.append(item)
        return self.map[item]


class CommunityFinder:
    """Responsible for applying InfoMap algorithm on a subgraph of the development database to
    identify communities"""
    def __init__(self, topic, personas=PERSONAS):
        """Constructor for CommunityFinder"""
        self.id_mapper = IDMapper()
        self.data = None
        self.catalog = dict()
        self.graph = None
        self.topic = topic
        self.personas = personas
        self.persona_map = {"leader": LeaderFinder, "content_creator": ContentCreatorFinder,
                            "amplifier": AmplifierFinder, "watchdog": WatchdogFinder}

    def _remap_ids(self, data):
        result = list()
        for line in data:
            # line: (a.id, a.follower_count, a.friend_count, b.id)
            # remap id
            a_id = line[0]
            b_id = line[3]
            new_a_id = self.id_mapper[a_id]
            new_b_id = self.id_mapper[b_id]
            # we will be creating weights on in-degrees, so we only care to keep Node a's counts
            result.append((new_a_id, line[1], line[2], new_b_id))
        catalog = dict(enumerate(self.id_mapper.ids, 1))
        return result, catalog

    def calculate_edge_weights(self):
        """Compute edge weights for user nodes given their follower and friend counts"""
        # follower counts tend to be higher than friend counts
        # a user with many followers and no friends may be spam
        # standardize follower and friend counts, add them together to produce edge weight
        follower_counts = list()
        friend_counts = list()
        for line in self.data:
            follower_counts.append(line[1] if line[1] else 0)
            friend_counts.append(line[2] if line[2] else 0)
        z_followers = zscore(follower_counts)
        z_friends = zscore(friend_counts)
        for i, line in enumerate(self.data):
            self.data[i] = (line[0],
                            line[3],
                            round(float(z_followers[i] + z_friends[i]), 5))

    def _create_graph(self):
        """Create a graph from the data that was loaded into the CommunityFinder object"""
        graph = nx.DiGraph()
        graph.add_weighted_edges_from(self.data)
        num_nodes = len(list(graph.nodes))
        print(f'Number of nodes: {num_nodes}')
        in_degrees = dict(graph.in_degree)
        print(f'Largest number of connections: {max(in_degrees.values())}')
        self.num_nodes = num_nodes
        self.graph = graph

    def _apply_infomap(self):
        """Partition network with infomap algorithm
            Annotates node with community_id and returns number of communities found"""
        infomapWrapper = Infomap("--two-level --directed")
        print("Building Infomap network from a NetworkX graph...")
        for e in self.graph.edges():
            infomapWrapper.addLink(*e)
        print("Find communities with Infomap...")
        infomapWrapper.run()
        print("Found %d top modules with codelength: %f" % (infomapWrapper.numTopModules(), infomapWrapper.codelength()))
        communities = {}
        for node in infomapWrapper.iterTree():
            if node.isLeaf():
                communities[node.physicalId] = node.moduleIndex()
        nx.set_node_attributes(self.graph, name='community', values=communities)
        self.graph = nx.relabel.relabel_nodes(self.graph, self.catalog, copy=True)
        self.num_modules = infomapWrapper.numTopModules()
        self.community_labels = set(nx.get_node_attributes(self.graph, "community").values())

    def _write_model_file(self):
        """Write the model as a list of edges and community labels"""
        gml_file = "\n".join(nx.generate_gml(self.graph, stringizer=nx.readwrite.gml.literal_stringizer))
        AWSWriter().write_model(gml_file, "models/network/" + self.topic + "_communities.gml")

    def prepare_model_for_db_merge3(self):
        """Exposed function for transforming internal model to nested list for neo4j merge"""
        # TODO: Update to include a persona param and write to a new folder
        nodes_list = list(self.graph.nodes(data=True))
        print("Writing community centers: ", len(nodes_list))
        # need to format into nested list for Cipher query to unwind
        model_results = list()
        centers_list = list()
        for node_id, properties in nodes_list:
            if "community" in properties.keys():
                if "center" in properties.keys():
                    if not node_id:
                        continue
                    else:
                        if properties["center"]:
                            centers_list.append(node_id)
                        model_results.append([node_id, properties["community"], properties["center"]])
        AWSWriter().write_model(str(centers_list), "models/network/"+self.topic+"_centers.txt")
        return model_results

    def prepare_model_for_db_merge2(self, persona):
        """Exposed function for transforming internal model to nested list for neo4j merge"""
        nodes_list = list(self.graph.nodes(data=True))
        # need to format into nested list for Cipher query to unwind
        model_results = list()
        persona_list = list()
        for node_id, properties in nodes_list:
            if "community" in properties.keys():
                if persona in properties.keys():
                    if not node_id:
                        continue
                    else:
                        if properties[persona]:
                            persona_list.append(node_id)
                        model_results.append([node_id, properties["community"],
                                              persona if properties[persona] else "None"])
        AWSWriter().write_model(str(persona_list), "models/network/"+self.topic+"_" + persona + ".txt")
        return model_results

    def prepare_model_for_db_merge(self):
        """Exposed function for transforming internal model to nested list for neo4j merge"""
        # TODO: Update to include a persona param and write to a new folder
        nodes_list = list(self.graph.nodes(data=True))
        # need to format into nested list for Cipher query to unwind
        model_results = list()
        leader_list = list()
        for node_id, properties in nodes_list:
            if "community" in properties.keys():
                if "leader" in properties.keys():
                    if not node_id:
                        continue
                    else:
                        if properties["leader"]:
                            leader_list.append(node_id)
                        model_results.append([node_id, properties["community"], properties["leader"]])
        AWSWriter().write_model(str(leader_list), "models/network/"+self.topic+"_leaders.txt")
        return model_results

    def fit(self, data):
        """Fits data to the model and applies InfoMap to find communities"""
        # data is type [(a.id, a.follower_count, a.friend_count, b.id)]
        self.data, self.catalog = self._remap_ids(data)
        self.calculate_edge_weights()
        self._create_graph()
        self._apply_infomap()
        # TODO: Incorporate persona finder fit() here
        self._write_model_file()


class PersonaFinder:
    """Base class for identifying Twitter User Personas"""
    def __init__(self):
        """Constructor for PersonaFinder"""
        self.community_buckets = dict()
        self.personas = list()
        self.query = str()

    def _split_users_by_community(self, graph, community_labels):
        for k in community_labels:
            self.community_buckets[k] = list()

        for node_id, properties in graph.nodes(data=True):
            if "community" in properties.keys():
                self.community_buckets[properties["community"]].append(node_id)

    def _find_persona(self, graph):
        """Instantiate base function for each subclass of PersonaFinder to implement"""
        pass

    def fit(self, graph, community_labels):
        """Exposed function for taking a graph with communities and assigning users a persona according
        to a set of rules"""
        self._split_users_by_community(graph, community_labels)
        self._find_persona(graph)


class LeaderFinder(PersonaFinder):
    """Responsible for identifying Twitter Users that are Leaders"""
    # Leaders have a lot of followers that also have a lot of followers and get a lot of retweets and mentions
    def __init__(self):
        super().__init__()
        self.query = "export_leader_network.cypher"

    def _find_persona(self, graph):
        for nodes in self.community_buckets.values():
            community_indegrees = dict(graph.in_degree(nodes))
            leader_node = max(community_indegrees, key=community_indegrees.get)
            nx.set_node_attributes(nx.subgraph(graph, nodes), False, "leader")
            graph.nodes[leader_node]["leader"] = True
            self.personas.append(leader_node)


class ContentCreatorFinder(PersonaFinder):
    """Responsible for identfying Twitter Users that are Content Creators"""
    def __init__(self):
        super().__init__()
        self.query = "export_content_creator_network.cypher"

    # ContentCreators write original tweets, most out degrees that are not retweets?
    def _find_persona(self, graph):
        for nodes in self.community_buckets.values():
            community_outdegrees = dict(graph.out_degree(nodes))
            content_creator_node = max(community_outdegrees, key=community_outdegrees.get)
            nx.set_node_attributes(nx.subgraph(graph, nodes), False, "content_creator")
            graph.nodes[content_creator_node]["content_creator"] = True
            self.personas.append(content_creator_node)


class AmplifierFinder(PersonaFinder):
    """Responsible for identifying Twitter Users that are Amplifiers"""
    def __init__(self):
        super().__init__()
        self.query = "export_amplifier_network.cypher"

    # Amplifiers retweet other users original content, most out degrees that are retweets?
    def _find_persona(self, graph):
        for nodes in self.community_buckets.values():
            community_outdegrees = dict(graph.out_degree(nodes))
            amplifier_node = max(community_outdegrees, key=community_outdegrees.get)
            nx.set_node_attributes(nx.subgraph(graph, nodes), False, "amplifier")
            graph.nodes[amplifier_node]["amplifier"] = True
            self.personas.append(amplifier_node)


class WatchdogFinder(PersonaFinder):
    """Responsible for identifying Twitter Users that are Watchdogs"""
    def __init__(self):
        super().__init__()
        self.query = "export_watchdog_network.cypher"

    # Watchdogs do mentions a lot?
    def _find_persona(self, graph):
        for nodes in self.community_buckets.values():
            community_outdegrees = dict(graph.out_degree(nodes))
            watchdog_node = max(community_outdegrees, key=community_outdegrees.get)
            nx.set_node_attributes(nx.subgraph(graph, nodes), False, "watchdog")
            graph.nodes[watchdog_node]["watchdog"] = True
            self.personas.append(watchdog_node)


class CenterFinder(PersonaFinder):
    """Responsible for identifying Twitter Users that are Centers"""
    # Leaders have a lot of followers that also have a lot of followers and get a lot of retweets and mentions
    def __init__(self):
        super().__init__()
        self.query = "export_full_network.cypher"

    def _find_persona(self, graph):
        for nodes in self.community_buckets.values():
            community_indegrees = dict(graph.in_degree(nodes))
            center_node = max(community_indegrees, key=community_indegrees.get)
            nx.set_node_attributes(nx.subgraph(graph, nodes), False, "center")
            graph.nodes[center_node]["center"] = True
            self.personas.append(center_node)

