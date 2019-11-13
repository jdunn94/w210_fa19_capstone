from infomap import Infomap
import networkx as nx

from datastorage import AWSWriter


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
    def __init__(self):
        """Constructor for CommunityFinder"""
        self.id_mapper = IDMapper()
        self.data = None
        self.catalog = dict()
        self.graph = None

    def _remap_ids(self, data):
        """Remap user id's to 1-len(unique(data)) so InfoMap will not C int overflow"""
        result = list()
        for id_pair in data:
            new_pair = tuple(self.id_mapper[x] for x in id_pair)
            result.append(new_pair)
        catalog = dict(enumerate(self.id_mapper.ids, 1))
        return result, catalog

    def _create_graph(self, data):
        """Create a graph from the data that was loaded into the CommunityFinder object"""
        graph = nx.DiGraph()
        graph.add_edges_from(data)
        num_nodes = len(list(graph.nodes))
        print(f'Number of nodes: {num_nodes}')
        in_degrees = dict(graph.in_degree)
        print(f'Largest number of connections: {max(in_degrees.values())}')
        self.num_nodes = num_nodes
        self.graph = graph

    def _apply_infomap(self):
        """Partition network with infomap algorithm
            Annotates node with community_id and returns number of communities found"""
        infomapWrapper = Infomap("--two-level -d")
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
        AWSWriter().write_model(gml_file, "models/communities.gml")

    def prepare_model_for_db_merge(self):
        """Exposed function for transforming internal model to nested list for neo4j merge"""
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
        AWSWriter().write_model(str(leader_list), "models/leaders.txt")
        return model_results

    def fit(self, data):
        """Fits data to the model and applies InfoMap to find communities"""
        self.data, self.catalog = self._remap_ids(data)
        self._create_graph(self.data)
        self._apply_infomap()
        self._write_model_file()


class PersonaFinder:
    """Base class for identifying Twitter User Personas"""
    def __init__(self):
        """Constructor for PersonaFinder"""
        self.community_buckets = dict()
        self.personas = list()

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
    # Leaders have a lot of followers that also have a lot of followers
    def _find_persona(self, graph):
        for nodes in self.community_buckets.values():
            community_indegrees = dict(graph.in_degree(nodes))
            leader_node = max(community_indegrees, key=community_indegrees.get)
            nx.set_node_attributes(nx.subgraph(graph, nodes), False, "leader")
            graph.nodes[leader_node]["leader"] = True
            self.personas.append(leader_node)


class ContentCreatorFinder(PersonaFinder):
    """Responsible for identfying Twitter Users that are Content Creators"""
    # ContentCreators write original tweets
    def _find_persona(self, graph):
        for nodes in self.community_buckets.values():
            pass



class AmplifierFinder(PersonaFinder):
    """Responsible for identifying Twitter Users that are Amplifiers"""
    # Amplifiers retweet other users original content
    def _find_persona(self, graph):
        pass


class WatchdogFinder(PersonaFinder):
    """Responsible for identifying Twitter Users that are Watchdogs"""
    # Watchdogs retweet news links without commentary
    def _find_persona(self, graph):
        pass


class AnnotatorFinder(PersonaFinder):
    """Responsible for identifying Twitter Users that are Annotators"""
    # Annotators retweet news links and other content with their own commentary attached
    def _find_persona(self, graph):
        pass

